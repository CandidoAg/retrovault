import { BadRequestException, Controller, Headers, Post, Req, Inject, Logger, Body } from "@nestjs/common";
import { TransactionRepository } from "../../domain/transaction.repository.js";
import { PaymentProcessedPublisher } from "../payment-processed.publisher.js";
import { OrderStatusGateway } from "../gateways/order-status.gateway.js";
import Stripe from "stripe";

@Controller('webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    @Inject('TransactionRepository') 
    private readonly transactionRepository: TransactionRepository,
    private readonly stripe: Stripe,
    private readonly paymentProcessedPublisher: PaymentProcessedPublisher,
    private readonly orderStatusGateway: OrderStatusGateway 
  ) {}

  @Post('stripe')
  async handleStripeWebhook(@Req() req: any, @Headers('stripe-signature') sig: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody, 
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      this.logger.error(`[Webhook Error] ❌ ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`[Webhook] Recibido evento: ${event.type}`);

    const session = event.data.object as any;
    const orderId = session.metadata?.orderId;
    const transactionId = session.metadata?.transactionId;

    if (!orderId || !transactionId) {
      // Estos eventos son informativos de Stripe pero no tienen nuestra metadata
      return { received: true };
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handlePaymentSuccess(transactionId, orderId);
        break;

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        await this.handlePaymentFailure(transactionId, orderId);
        break;

      default:
        this.logger.log(`[Webhook] Evento omitido: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(transactionId: string, orderId: string) {
    this.logger.log(`[Webhook] ✅ Intentando confirmar: Trx ${transactionId} (Pedido: ${orderId})`);
    
    const transaction = await this.transactionRepository.findByOrderId(orderId);

    if (!transaction) {
      this.logger.error(`[Webhook] ❌ No se encontró transacción local para el pedido ${orderId}`);
      return;
    }

    try {
      await this.transactionRepository.updateStatus(transaction.id, 'COMPLETED' as any);
      
      this.orderStatusGateway.notifyOrderUpdate(orderId, 'PAID');
      this.logger.log(`[Webhook] 📱 Frontend notificado vía Socket para pedido ${orderId}`);

      const updatedTransaction = await this.transactionRepository.findByOrderId(orderId);
      if (updatedTransaction) {
        await this.paymentProcessedPublisher.publish(updatedTransaction, ""); 
        this.logger.log(`[Webhook] 📢 Evento Kafka publicado para pedido ${orderId}`);
      }
      
    } catch (error: any) {
      this.logger.error(`[Webhook] Error al procesar éxito: ${error.message}`);
    }
  }

  private async handlePaymentFailure(transactionId: string, orderId: string) {
    this.logger.warn(`[Webhook] ❌ Pago fallido o expirado: Trx ${transactionId} (Pedido: ${orderId})`);
    
    try {
      await this.transactionRepository.updateStatus(transactionId, 'FAILED' as any);
      
      this.orderStatusGateway.notifyOrderUpdate(orderId, 'FAILED');
    } catch (error: any) {
      this.logger.error(`[Webhook] Error al procesar fallo: ${error.message}`);
    }
  }

  @Post('cancel-manually')
  async manualCancel(@Body() body: { orderId: string }) {
    const { orderId } = body;
    const transaction = await this.transactionRepository.findByOrderId(orderId);
    if (!transaction) throw new BadRequestException('No existe la transacción');
    
    const sessions = await this.stripe.checkout.sessions.list({ 
      limit: 1 
    });
    const session = sessions.data.find(s => s.metadata?.orderId === orderId);
    const productNames = session?.metadata?.productNames ? session.metadata.productNames : "";
    await this.transactionRepository.updateStatus(transaction.id, 'FAILED' as any);
    await this.paymentProcessedPublisher.publish(transaction, productNames); 
    return { success: true };
  }
}
import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { ProcessPaymentUseCase } from "../../application/process-payment.usecase.js";

@Controller('payments')
export class PaymentController {
  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase) {}

  @Post('checkout')
  async createCheckout(@Body() body: any) {
    console.log("checkout body: " + JSON.stringify(body));
    try {
      // Invocamos el caso de uso que ya tienes con Stripe
      const { transaction, checkoutUrl } = await this.processPaymentUseCase.execute({
        orderId: body.orderId,
        amount: body.amount, // El total de la orden
        customerName: body.customerName,
        items: body.items, // Array de productos [{name, price, quantity}]
      });

      return { checkoutUrl, transactionId: transaction.id };
    } catch (error: any) {
      console.error(error);
      throw new BadRequestException('Error al conectar con Stripe');
    }
  }
}
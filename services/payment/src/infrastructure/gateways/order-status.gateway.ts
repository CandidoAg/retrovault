import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { TransactionRepository } from '../../domain/transaction.repository.js';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class OrderStatusGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async handleConnection(client: Socket) {
    const orderId = client.handshake.query.orderId as string;
    
    if (orderId) {
      client.join(`order_${orderId}`);
      console.log(`[WS] Cliente conectado al pedido: ${orderId}`);

      try {
        const transaction = await this.transactionRepository.findByOrderId(orderId);
        
        if (transaction && transaction.status === 'COMPLETED') {
          // Si ya está pagado, se lo decimos inmediatamente
          client.emit('order_status_changed', {
            orderId,
            status: 'PAID',
          });
          console.log(`[WS] Estado inicial enviado: PAID para ${orderId}`);
        }
      } catch (e) {
        console.error('[WS] Error consultando estado inicial:', e);
      }
    }
  }

  notifyOrderUpdate(orderId: string, status: string) {
    if (this.server) {
      this.server.to(`order_${orderId}`).emit('order_status_changed', {
        orderId,
        status,
      });
      console.log(`[WS] Emitido estado ${status} para pedido ${orderId}`);
    }
  }
}
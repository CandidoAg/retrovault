import { OrderStatus } from '@retrovault/shared';
import { OrderRepository } from '../domain/order.repository.js';

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}

export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(input: UpdateOrderStatusInput): Promise<void> {
    console.log(`[OrderUseCase] 🔄 Updating order ${input.orderId} to status: ${input.status}`);

    const order = await this.orderRepository.findById(input.orderId);

    if (!order) {
      console.error(`[OrderUseCase] ❌ Order ${input.orderId} not found`);
      return;
    }

    // Aquí podrías añadir lógica de negocio, ej: no cancelar si ya está enviada
    await this.orderRepository.updateStatus(input.orderId, input.status);
    
    console.log(`[OrderUseCase] ✅ Order ${input.orderId} is now ${input.status}`);
  }
}
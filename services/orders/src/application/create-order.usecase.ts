import { Order } from '../domain/order.entity.js';
import { OrderRepository } from '../domain/order.repository.js';
import { ProductRepository } from '../domain/product.repository.js';
import { OrderCreatedPublisher } from '../infrastructure/order-created.publisher.js';
import { RetroProduct } from '@retrovault/shared';
import { v4 as uuidv4 } from 'uuid';

export interface OrderItemInput {
  id: string;
  quantity: number;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepo: OrderRepository,
    private productRepo: ProductRepository,
    private eventPublisher: OrderCreatedPublisher
  ) {}

  async execute(customerId: string, itemsInput: OrderItemInput[], customerName: string) {
    const items: RetroProduct[] = [];
    
    for (const input of itemsInput) {
      const product = await this.productRepo.findById(input.id);
      
      // Validación estricta de stock
      if (!product || product.stock < input.quantity) {
        throw new Error(`Producto ${input.id} no disponible o stock insuficiente`);
      }

      items.push({id: product.id,name: product.name,price: product.price,stock: product.stock,quantity: input.quantity});
    }

    const order = new Order(uuidv4(), customerId, items);
    await this.orderRepo.save(order);

    await this.eventPublisher.publish({
      orderId: order.id,
      customerId: order.customerId,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt,
      customerName: customerName, 
    });

    return order;
  }
}
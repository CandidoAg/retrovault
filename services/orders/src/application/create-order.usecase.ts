import { Order } from '../domain/order.entity.js';
import { OrderRepository } from '../domain/order.repository.js';
import { ProductRepository } from '../domain/product.repository.js';
import { OrderCreatedPublisher } from '../infrastructure/order-created.publisher.js';
import { v4 as uuidv4 } from 'uuid';

export class CreateOrderUseCase {
  constructor(
    private orderRepo: OrderRepository,
    private productRepo: ProductRepository,
    private eventPublisher: OrderCreatedPublisher
  ) {}

  async execute(customerId: string, productIds: string[]) {
    const items = [];
    for (const id of productIds) {
      const product = await this.productRepo.findById(id);
      if (!product || product.stock <= 0) throw new Error(`Producto ${id} no disponible`);
      items.push(product);
    }

    const order = new Order(uuidv4(), customerId, items);
    await this.orderRepo.save(order);

    await this.eventPublisher.publish({
      orderId: order.id,
      customerId: order.customerId,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt
    });

    return order;
  }
}
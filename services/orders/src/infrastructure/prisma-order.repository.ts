import { PrismaClient } from './generated/client/index.js';
import { Order } from '../domain/order.entity.js';
import { OrderRepository } from '../domain/order.repository.js';

export class PrismaOrderRepository implements OrderRepository {
  private prisma = new PrismaClient();

  async save(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.id,
        customerId: order.customerId,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  }

  async findById(id: string): Promise<Order | null> {
    const res = await this.prisma.order.findUnique({ where: { id } });
    return res ? new Order(res.id, res.customerId, [], res.status) : null;
  }

  async findAll(): Promise<Order[]> {
    const res = await this.prisma.order.findMany();
    return res.map(o => new Order(o.id, o.customerId, []));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: { status }
    });
  }
}
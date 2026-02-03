import { PrismaClient } from './generated/client/index.js';
import { Order } from '../domain/order.entity.js';
import { OrderRepository } from '../domain/order.repository.js';
import { Injectable } from '@nestjs/common';
import { RetroProduct } from '@retrovault/shared';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  private prisma = new PrismaClient();

  async save(order: Order): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          id: order.id,
          customerId: order.customerId,
          total: order.total, 
          status: order.status,
          createdAt: order.createdAt,
          items: {
            create: order.items.map((item) => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      });
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

async findByCustomerId(customerId: string): Promise<Order[]> {
    const ordersWithItems = await this.prisma.order.findMany({
      where: { customerId },
      include: { 
        items: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    return ordersWithItems.map(( o: any) => {
      const items: RetroProduct[] = o.items.map((i: any) => ({
        id: i.productId,
        name: i.name || 'Producto Retro', 
        price: Number(i.price),
        quantity: i.quantity
      }));

      const date = new Date(o.createdAt);
      const formattedDate = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const order = new Order(o.id, o.customerId, items, o.status);
      (order as any).createdAt = formattedDate; 
      return order;
    });
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: { status }
    });
  }
}
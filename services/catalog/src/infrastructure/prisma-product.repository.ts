import { PrismaClient } from './generated/client/index.js';
import { Product } from '../domain/product.entity.js';
import { ProductRepository } from '../domain/product.repository.js';

export class PrismaProductRepository implements ProductRepository {
  private prisma = new PrismaClient();

  async save(product: Product): Promise<void> {
    await this.prisma.product.upsert({
      where: { name: product.name }, // Busca por nombre único
      update: { 
        price: product.price, 
        stock: product.stock 
      },
      create: { 
        name: product.name, 
        price: product.price, 
        stock: product.stock, 
        year: product.year 
      }
    });
  }

  async findById(id: string): Promise<Product | null> {
    const p = await this.prisma.product.findUnique({ where: { id } });
    return p ? new Product(p.id, p.name, p.price, p.stock, p.year) : null;
  }

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    return products.map(p => new Product(p.id, p.name, p.price, p.stock, p.year));
  }
}
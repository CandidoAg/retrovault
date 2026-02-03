import { PrismaClient } from './generated/client/index.js';
import { Product } from '../domain/product.entity.js';
import { ProductRepository } from '../domain/product.repository.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  private prisma = new PrismaClient();

  async save(product: Product): Promise<void> {
    await this.prisma.product.upsert({
      where: { name: product.name }, // Busca por nombre único
      update: { 
        price: product.price, 
        stock: product.stock, 
        year: product.year,
        brand: product.brand,
        description: product.description, 
        rating: product.rating
      },
      create: { 
        id: product.id,
        name: product.name, 
        price: product.price, 
        stock: product.stock, 
        year: product.year,
        brand: product.brand,
        description: product.description, 
        rating: product.rating
      }
    });
  }

  async findById(id: string): Promise<Product | null> {
    const p = await this.prisma.product.findUnique({ where: { id } });
    return p ? new Product(p.id, p.name, p.price, p.stock, p.year, p.brand, p.description??undefined, p.rating??0) : null;
  }

  async findByName(name: string): Promise<Product | null> {
    const p = await this.prisma.product.findUnique({ where: { name } });
    return p ? new Product(p.id, p.name, p.price, p.stock, p.year, p.brand, p.description??undefined, p.rating??0) : null;
  }

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    return products.map(p => new Product(p.id, p.name, p.price, p.stock, p.year, p.brand, p.description??undefined, p.rating??0));
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const p = await this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        stock: data.stock,
        year: data.year,
        brand: data.brand,
        description: data.description,
        rating: data.rating
      },
    });
    return new Product(p.id, p.name, p.price, p.stock, p.year, p.brand, p.description??undefined, p.rating??0);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }
}
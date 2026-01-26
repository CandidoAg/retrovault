import { PrismaClient } from './generated/client/index.js';
import { CatalogProduct } from '../domain/catalog-product.entity.js';
import { ProductRepository } from '../domain/product.repository.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaCatalogProductRepository implements ProductRepository {
  private prisma = new PrismaClient();

  async save(product: CatalogProduct): Promise<void> {
    await this.prisma.catalogProduct.upsert({
      where: { id: product.id }, // El ID viene de Catalog
      update: { 
        name: product.name, 
        price: product.price, 
        stock: product.stock 
      },
      create: { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        stock: product.stock 
      }
    });
  }

  async findById(id: string): Promise<CatalogProduct | null> {
    const p = await this.prisma.catalogProduct.findUnique({ where: { id } });
    return p ? new CatalogProduct(p.id, p.name, p.price, p.stock) : null;
  }

  async findAll(): Promise<CatalogProduct[]> {
    const products = await this.prisma.catalogProduct.findMany();
    return products.map(p => new CatalogProduct(p.id, p.name, p.price, p.stock));
  }
}
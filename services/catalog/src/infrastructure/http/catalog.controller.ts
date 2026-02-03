import { Controller, Get, Post, Body, Param, NotFoundException, Inject, Patch, Delete } from '@nestjs/common';
import { DecreaseStockUseCase } from '../../application/decrease-stock.usecase.js';
import { PrismaProductRepository } from '../prisma-product.repository.js';
import { CreateProductUseCase } from '../../application/create-product.usecase.js';
import { UpdateProductUseCase } from '@/application/update-product.usecase.js';
import { DeleteProductUseCase } from '@/application/delete-product.usecase.js';

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly decreaseStockUseCase: DecreaseStockUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase, 
    private readonly deleteProductUseCase: DeleteProductUseCase,
    @Inject(PrismaProductRepository)
    private readonly productRepository: any 
  ) {}

  @Get()
  async getAll() {
    return await this.productRepository.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  @Post('decrease-stock')
  async decrease(@Body() body: { productId: string; quantity: number, rating?: number }) {
    await this.decreaseStockUseCase.execute(body.productId, body.quantity);
    return { message: 'Stock actualizado correctamente' };
  }

  @Post()
  async create(@Body() body: { name: string; price: number; stock: number, year: number, brand: string, description?: string, rating?: number }) {
    const product = await this.createProductUseCase.execute(body);
    return { message: 'Producto creado y sincronizado', product };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() body: any
  ) {
    const product = await this.updateProductUseCase.execute(id, body);
    return { message: 'Producto actualizado', product };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteProductUseCase.execute(id);
    return { message: 'Producto eliminado de la bóveda' };
  }
}
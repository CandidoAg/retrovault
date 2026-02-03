import { Controller, Post, Body, BadRequestException, Get, Query } from '@nestjs/common';
import { CreateOrderUseCase } from '../../application/create-order.usecase.js';
import { PrismaOrderRepository } from '../../infrastructure/prisma-order.repository.js';
import { PrismaCatalogProductRepository } from '../prisma-catalog-product.repository.js';

@Controller('orders')
export class OrderController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase, 
              private readonly prismaOrderRepository: PrismaOrderRepository,
              private readonly prismaCatalogProductRepository: PrismaCatalogProductRepository ) {}

  @Post()
  async create(@Body() rawBody: any) {
    const { customerId, customerName, items } = rawBody;
        
    // Validaciones mínimas
    if (!customerId || !customerName || !items) {
      throw new BadRequestException('Datos insuficientes para crear la orden');
    }

    try {
      // Crea la orden y PUBLICA el evento en Kafka (OrderCreatedEvent)
      const order = await this.createOrderUseCase.execute(customerId, items, customerName);

      // Devolvemos la orden para que el frontend sepa el ID y el Total
      return { 
        message: 'Orden creada satisfactoriamente', 
        order 
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
    
  }

  @Get('/')
  async getOrders() {
    return this.prismaOrderRepository.findAll();
  }

  @Get('products')
  getProducts() {
    return this.prismaCatalogProductRepository.findAll();
  }

  @Get('success')
  async handleSuccess(@Query('session_id') sessionId: string) {
    return {
      message: '¡Pago recibido!',
      sessionId,
      detail: 'Tu pedido está siendo procesado.'
    };
  }

  @Get('my-orders')
  async getMyOrders(@Query('customerId') customerId: string) {
    return this.prismaOrderRepository.findByCustomerId(customerId);
  }

  @Get('cancel')
  async handleCancel() {
    return {
      message: 'Pago cancelado',
      detail: 'Puedes intentar realizar el pago de nuevo desde tu carrito.'
    };
  }
}
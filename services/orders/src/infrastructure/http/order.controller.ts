import { Controller, Post, Body, Get, Param, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { CreateOrderUseCase } from '../../application/create-order.usecase.js';
import { PrismaOrderRepository } from '../prisma-order.repository.js';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject(PrismaOrderRepository)
    private readonly orderRepository: any 
  ) {}

  @Post()
  async create(@Body() rawBody: any) {

    if (!rawBody.customerId || typeof rawBody.customerId !== 'string') {
      throw new BadRequestException('Invalid order data: customerId is required');
    }

    if (!rawBody.customerName || typeof rawBody.customerName !== 'string') {
      throw new BadRequestException('Invalid order data: customerName is required');
    }

    if (!rawBody.items || !Array.isArray(rawBody.items) || rawBody.items.length === 0) {
      throw new BadRequestException('Invalid order data: items array is required and cannot be empty');
    }

    const { customerId, customerName, items } = rawBody;
    
    // Obtenemos los IDs de los productos
    const productIds = items.map((item: any) => item.id);

    // Ejecutamos el caso de uso
    const order = await this.createOrderUseCase.execute(customerId, productIds, customerName);

    return { message: 'Pedido realizado con éxito', order };
  }

  @Get()
  async getAll() {
    return await this.orderRepository.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }
}
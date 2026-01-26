import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { OrdersModule } from './orders.module.js';
import 'dotenv/config.js';
async function bootstrap() {
  console.log('🚀 Iniciando servicio de Orders...');

  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      OrdersModule,
      new FastifyAdapter()
    );

    const port = 3002;
    
    await app.listen(port, '0.0.0.0');
    console.log(`📦 Orders Service running on: http://localhost:${port}`);
    
  } catch (error) {
    console.error('❌ Error fatal al arrancar Orders:', error);
    process.exit(1);
  }
}

bootstrap();
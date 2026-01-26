import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { CatalogModule } from './catalog.module.js'; // Importante el .js

async function bootstrap() {
  console.log('🚀 Iniciando proceso de arranque de Catalog...');
  
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      CatalogModule,
      new FastifyAdapter()
    );

    const port = 3005;
    await app.listen(port, '0.0.0.0');
    console.log(`📦 Catalog Service running on: http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Error fatal durante el arranque:', error);
    process.exit(1);
  }
}

bootstrap();
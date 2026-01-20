import { v4 as uuidv4 } from 'uuid';
import { Product } from './domain/product.entity.js';
import { PrismaProductRepository } from './infrastructure/prisma-product.repository.js';
import { ProductCreatedPublisher } from './infrastructure/product-created.publisher.js';
import { DecreaseStockUseCase } from './application/decrease-stock.usecase.js';
import { OrderCreatedConsumer } from './infrastructure/order-created.consumer.js';
import { CompensateStockUseCase } from './application/compensate-stock.usecase.js';
import { PaymentFailedConsumer } from './infrastructure/payment-failed.consumer.js';
import { kafka } from './infrastructure/kafka.client.js';

async function run() {
  // 1. Inicializar Infraestructura (usarán el cliente centralizado internamente)
  const productRepo = new PrismaProductRepository();
  const productPublisher = new ProductCreatedPublisher();

  // 2. Inicializar Casos de Uso y Consumidores
  const decreaseStockUseCase = new DecreaseStockUseCase(productRepo, productPublisher);
  const compensateUseCase = new CompensateStockUseCase(productRepo, productPublisher);
  const orderConsumer = new OrderCreatedConsumer(decreaseStockUseCase);
  const paymentFailedConsumer = new PaymentFailedConsumer(kafka, compensateUseCase);
  
  console.log('🚀 [Catalog Service] Online. Escuchando eventos de compra...');
  await orderConsumer.run();
  await paymentFailedConsumer.run();

  // 3. Preparar productos de prueba
  const productsToSync = [
    { name: "The Legend of Zelda", price: 59.99, stock: 10, year: 1986 },
    { name: "Super Mario Bros", price: 39.50, stock: 5, year: 1985 }
  ];

  console.log('\n📦 [Catalog] Sincronizando productos...');

  for (const item of productsToSync) {
    const all = await productRepo.findAll();
    let existingProduct = all.find(p => p.name === item.name);

    let productToSave: Product;

    if (!existingProduct) {
      productToSave = new Product(uuidv4(), item.name, item.price, item.stock, item.year);
      console.log(`✨ Creando: ${item.name}`);
    } else {
      productToSave = new Product(existingProduct.id, item.name, item.price, item.stock, item.year);
      console.log(`✔️ Existente: ${item.name}`);
    }

    await productRepo.save(productToSave);
    await productPublisher.publish(productToSave);
    
    console.log(`✅ [CATALOG] Sincronizado: ${productToSave.name} | ID: ${productToSave.id}`);
  }

  console.log('\n⌛ Esperando órdenes de compra de Kafka...');
}

run().catch(console.error);
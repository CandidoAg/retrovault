import { CreateOrderUseCase } from './application/create-order.usecase.js';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository.js';
import { PrismaCatalogProductRepository } from './infrastructure/prisma-catalog-product.repository.js';
import { OrderCreatedPublisher } from './infrastructure/order-created.publisher.js';
import { ProductCreatedConsumer } from './infrastructure/product-created.consumer.js';
import { UpdateOrderStatusUseCase } from './application/update-order-status.usecase.js';
import { PaymentProcessedConsumer } from './infrastructure/payment-processed.consumer.js';
import { kafka } from './infrastructure/kafka.client.js'; // Importamos tu cliente limpio
import { CatalogProduct } from './domain/catalog-product.entity.js';

async function doTransaction(transtionNumber: number, product: CatalogProduct | undefined, createOrderUseCase: CreateOrderUseCase) {
  if (!product) {
    console.error("❌ Error: Producto no sincronizado en Orders DB todavía.");
    return;
  }

  console.log(`🎯 Comprando ${product.name} (UUID: ${product.id})...`);

  // Ejecución de la compra
  const order = await createOrderUseCase.execute("customer-pro-1", [product.id]);
  
  console.log(`
  ✅ [PEDIDO ${transtionNumber} COMPLETADO]
  ID Pedido: ${order.id}
  Producto:  ${product.name}
  Total:     ${order.total}€
  `);
}

async function run() {
  const orderRepo = new PrismaOrderRepository();
  const productRepo = new PrismaCatalogProductRepository();
  const eventPublisher = new OrderCreatedPublisher();
  
  const createOrderUseCase = new CreateOrderUseCase(orderRepo, productRepo, eventPublisher);
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepo);
  
  // Pasamos el cliente centralizado al consumidor
  const productConsumer = new ProductCreatedConsumer(kafka, productRepo);
  const paymentConsumer = new PaymentProcessedConsumer(kafka, updateOrderStatusUseCase);
  
  console.log('🚀 [Orders Service] Online y escuchando cambios de stock...');
  await productConsumer.run();
  await paymentConsumer.run();
  
  // Simulamos UNA ÚNICA COMPRA a los 10 segundos
  setTimeout(async () => {
    console.log('\n🛒 [Simulación] Iniciando compra única de prueba...');
    
    try {
      const allProducts = await productRepo.findAll();
      const zelda = allProducts.find(p => p.name === "The Legend of Zelda");
      const mario = allProducts.find(p => p.name === "Super Mario Bros");

      await doTransaction(1, zelda, createOrderUseCase);
      await doTransaction(2, mario, createOrderUseCase);
      
    } catch (error: any) {
      console.error(`❌ Error en la simulación: ${error.message}`);
    }
  }, 10000); 
}

run().catch(console.error);
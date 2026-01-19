import { CreateOrderUseCase } from './application/create-order.usecase.js';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository.js';
import { PrismaCatalogProductRepository } from './infrastructure/prisma-catalog-product.repository.js';
import { OrderCreatedPublisher } from './infrastructure/order-created.publisher.js';
import { ProductCreatedConsumer } from './infrastructure/product-created.consumer.js';
import { kafka } from './infrastructure/kafka.client.js'; // Importamos tu cliente limpio

async function run() {
  const orderRepo = new PrismaOrderRepository();
  const productRepo = new PrismaCatalogProductRepository();
  const eventPublisher = new OrderCreatedPublisher();
  
  const createOrderUseCase = new CreateOrderUseCase(orderRepo, productRepo, eventPublisher);
  
  // Pasamos el cliente centralizado al consumidor
  const productConsumer = new ProductCreatedConsumer(kafka, productRepo);
  
  console.log('🚀 [Orders Service] Online y escuchando cambios de stock...');
  await productConsumer.run();

  // Simulamos UNA ÚNICA COMPRA a los 10 segundos
  setTimeout(async () => {
    console.log('\n🛒 [Simulación] Iniciando compra única de prueba...');
    
    try {
      const allProducts = await productRepo.findAll();
      const target = allProducts.find(p => p.name === "The Legend of Zelda");

      if (!target) {
        console.error("❌ Error: Producto no sincronizado en Orders DB todavía.");
        return;
      }

      console.log(`🎯 Comprando ${target.name} (UUID: ${target.id})...`);

      // Ejecución de la compra
      const order = await createOrderUseCase.execute("customer-pro-1", [target.id]);
      
      console.log(`
      ✅ [PEDIDO COMPLETADO]
      ID Pedido: ${order.id}
      Producto:  ${target.name}
      Total:     ${order.total}€
      `);
      
    } catch (error: any) {
      console.error(`❌ Error en la simulación: ${error.message}`);
    }
  }, 10000); 
}

run().catch(console.error);
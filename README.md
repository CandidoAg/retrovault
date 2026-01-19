# 🕹️ RetroVault: Arquitectura de Microservicios
Sistema de e-commerce especializado en videojuegos clásicos, desarrollado con Arquitectura Hexagonal, DDD (Domain-Driven Design) y comunicación asíncrona mediante Kafka.


## 🚀 Estado del Sistema
- **Catalog Service**: (Activo) Gestión de inventario, productos y sincronización de stock mediante UUIDs.
- **Orders Service**: (Activo) Procesamiento de pedidos y réplica local de productos para alta disponibilidad.
- **Payment Service**: ⏳ (En desarrollo)
- **Frontend**: ⏳ (Pendiente)

## 🛠️ Tecnologías Principales
- **Lenguaje**: TypeScript
- **Runtime**: Node.js (tsx para ejecución directa)
- **Base de Datos**: PostgreSQL (Instancias independientes por servicio)
- **ORM**: Prisma
- **Mensajería**: Apache Kafka (KafkaJS)
- **Gestor de Paquetes**: pnpm
- **Infraestructura**: Docker & Docker Compose

## ⚙️ Configuración de Variables de Entorno (.env)
Debes crear un archivo .env en la raíz de la carpeta de cada microservicio:

### `services/catalog/.env`
```env
DATABASE_URL="postgresql://admin:password123@localhost:5433/catalog_db"
KAFKA_BROKERS="localhost:9092"
```
### `services/orders/.env`
```env
DATABASE_URL="postgresql://admin:password123@localhost:5434/orders_db"
KAFKA_BROKERS="localhost:9092"
```
## 🏗️ Guía de Instalación y Uso
1. Levantar Infraestructura (Docker)
Desde la raíz del proyecto, inicia los servicios de base de datos y mensajería:
    ```bash
    docker-compose up -d
    ```
2. Instalación de dependencias
Utiliza pnpm para instalar todos los paquetes del monorepositorio:
    ```bash
    pnpm install
    ```
3. Preparación de Bases de Datos (Prisma)
Sincroniza los esquemas para generar las tablas y los clientes de Prisma.

    ***En el servicio Catalog:***

    ```bash
    cd services/catalog
    pnpm exec prisma db push
    pnpm exec prisma generate
    cd ../..
    ```

    ***En el servicio Orders:***

    ```bash
    cd services/orders
    pnpm exec prisma db push
    pnpm exec prisma generate
    cd ../..
    ```
## 🧪 Ejecución de Tests de Integración
Para validar la comunicación bidireccional y la sincronización de stock, abre dos terminales:
**Terminal A (Catalog Service):**
```bash
cd services/catalog
pnpm exec tsx src/test-catalog.ts
```

***Terminal B (Orders Service):***
```bash
cd services/orders
pnpm exec tsx src/test-orders.ts
```
> 💡 **Tip de sincronización:** El test de Orders espera automáticamente 10 segundos. Esto garantiza que Kafka haya entregado los productos de Catalog a la base de datos de Orders antes de intentar comprar.

## 🔄 Flujo de Comunicación
* Catalog publica productos con UUID (string) al arrancar.
* Orders consume los eventos y actualiza su base de datos local (upsert).
* Orders simula una compra y publica el evento order-events.
* Catalog consume la orden, descuenta el stock y publica el producto actualizado.
* Orders recibe la actualización y sincroniza su stock local automáticamente.
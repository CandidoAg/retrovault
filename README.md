# 🕹️ RetroVault: Arquitectura de Microservicios
Sistema de e-commerce especializado en videojuegos clásicos, desarrollado con Arquitectura Hexagonal, DDD (Domain-Driven Design) y comunicación asíncrona mediante Kafka.

## 🛠️ Tecnologías Principales
- **Lenguaje**: TypeScript
- **Runtime**: Node.js (tsx para ejecución directa)
- **Base de Datos**: PostgreSQL (Instancias independientes por servicio)
- **ORM**: Prisma
- **Mensajería**: Apache Kafka (KafkaJS)
- **Gestor de Paquetes**: pnpm
- **Infraestructura**: Docker & Docker Compose

## ⚙️ Configuración de Variables de Entorno (.env)
> **AVISO DE SEGURIDAD:** Las siguientes configuraciones están diseñadas exclusivamente para **entornos de desarrollo local**. Para despliegues en **producción**, es imperativo sustituir las credenciales por contraseñas robustas y cambiar localhost por la dirección IP o el Host correspondiente a su infraestructura de base de datos.

### `services/catalog/.env`
```env
POSTGRES_USER=admin_catalog
POSTGRES_PASSWORD=catalog_pass_123
POSTGRES_DB=catalog_db
CATALOG_DB_PORT=5433
CATALOG_DB_IP=localhost

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${CATALOG_DB_IP}:${CATALOG_DB_PORT}/${POSTGRES_DB}"
KAFKA_BROKERS="localhost:9092"
```
### `services/orders/.env`
```env
POSTGRES_USER=admin_orders
POSTGRES_PASSWORD=orders_pass_123
POSTGRES_DB=orders_db
ORDERS_DB_PORT=5434
ORDERS_DB_IP=localhost

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${ORDERS_DB_IP}:${ORDERS_DB_PORT}/${POSTGRES_DB}"
KAFKA_BROKERS="localhost:9092"
```

## 🏗️ Guía de Instalación y Uso
0. Preparación de variables de entorno
Antes de nada, debes crear los archivos reales a partir de las plantillas. Esto es necesario para que Docker y Prisma sepan cómo conectarse a las bases de datos:
    ```bash
    # Desde la raíz del proyecto:
    cp services/catalog/.env.example services/catalog/.env
    cp services/orders/.env.example services/orders/.env
    ```
1. Levantar Infraestructura (Docker)
Desde la raíz del proyecto, inicia los servicios de base de datos y mensajería:
    ```bash
    pnpm docker:up
    ```
2. Instalación de dependencias
Utiliza pnpm para instalar todos los paquetes del monorepositorio:
    ```bash
    pnpm install
    ```
3. Preparación de Bases de Datos (Prisma)
Sincroniza los esquemas para generar las tablas y los clientes de Prisma en todos los microservicios con un solo comando:
    ```bash
    pnpm db:push
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

## 🗺️ Roadmap del Proyecto

Este proyecto sigue una evolución modular, desde la base de la comunicación asíncrona hasta la resiliencia avanzada de sistemas distribuidos.

### ✅ Fase 0: Cimientos y Comunicación (Completado)
- **Catalog Service:** Microservicio con arquitectura hexagonal para la gestión de inventario.
- **Orders Service:** Microservicio para la creación y gestión de pedidos.
- **Mensajería con Kafka:** Comunicación desacoplada entre servicios mediante eventos.
- **Persistencia Independiente:** Bases de datos PostgreSQL dedicadas por servicio con Prisma ORM.
- **Orquestación con Docker:** Entorno de desarrollo unificado con Docker Compose.

### 🏗️ Fase 1: Transacciones Distribuidas (En Proceso)
- [ ] **Payment Service:** Nuevo microservicio para el procesamiento financiero.
- [ ] **Patrón Saga (Coreografía):** Implementación de lógica de compensación. Si el pago falla, se dispara un evento para que `Catalog` restaure el stock y `Orders` marque la orden como fallida automáticamente.

### 🛡️ Fase 2: Contratos de Datos y Validación
- [ ] **Shared Schemas (Zod):** Centralización de contratos de eventos en `packages/shared`.
- [ ] **Validación Estricta:** Garantizar que ningún mensaje corrupto sea procesado por los microservicios.

### 🧪 Fase 3: Calidad y Automatización (CI/CD)
- [ ] **Testing de Integración:** Uso de **Testcontainers** para pruebas reales con contenedores efímeros de Postgres y Kafka.
- [ ] **GitHub Actions:** Pipeline automatizado para validar el build, los tests y la sincronización de DB en cada `push`.

### 💻 Fase 4: Seguridad y Frontend
- [ ] **API Gateway:** Punto de entrada único con ruteo inteligente.
- [ ] **Autenticación JWT:** Seguridad centralizada para proteger los recursos del sistema.
- [ ] **Frontend (Next.js):** Interfaz de usuario profesional para la navegación y compra de productos.

### 📈 Fase 5: Resiliencia y Observabilidad (Enterprise)
- [ ] **Observabilidad:** Tracing distribuido con OpenTelemetry para visualizar el viaje de cada orden.
- [ ] **Circuit Breaker:** Gestión de fallos para evitar caídas en cascada.
- [ ] **Graceful Shutdown:** Cierre de conexiones seguro para evitar pérdida de datos.
# 🕹️ RetroVault: Arquitectura de Microservicios
Sistema de e-commerce especializado en videojuegos clásicos, desarrollado con **Arquitectura Hexagonal**, **DDD (Domain-Driven Design)** y comunicación asíncrona mediante **Kafka** aplicando el patrón **Saga**.

## 🛠️ Tecnologías Principales
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Zod](https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Testcontainers](https://img.shields.io/badge/Testcontainers-000?style=for-the-badge&logo=testcontainers&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![Turborepo](https://img.shields.io/badge/turborepo-000000?style=for-the-badge&logo=turborepo&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
- **Lenguaje**: TypeScript 
- **Runtime**: Node.js (tsx para ejecución directa)
- **Base de Datos**: PostgreSQL (Instancias independientes por servicio)
- **ORM**: Prisma
- **Validación de Datos**: Zod (Validación estricta de variables de entorno y contratos de Kafka).
- **Testing**: **Vitest** (Unit & Integration) + **Testcontainers** (Bases de datos PostgreSQL efímeras e independientes por suite).
- **Mensajería**: Apache Kafka (KafkaJS)
- **Gestor de Monorepo**: Turborepo (Orquestación de tareas y caché persistente).
- **Gestor de Paquetes**: pnpm
- **Infraestructura**: Docker & Docker Compose
- **Pasarela de Pagos**: Stripe API (SDK oficial) para procesamiento de transacciones y simulación de estados financieros.

## 🧪 Testing & Calidad (Fase 3 - Completada)
Todo el ecosistema de RetroVault cuenta con una suite de tests automatizada que garantiza la integridad de los datos y la lógica de negocio:

* **Tests de Integración (Full Stack Tech)**: Cada servicio utiliza **Testcontainers** para levantar una instancia limpia de PostgreSQL. Esto permite validar los esquemas de Prisma y las constraints de base de datos sin contaminar entornos locales.
* **Mocks de Infraestructura**: 
    - **Kafka**: Simulación de brokers para testear el envío y recepción de eventos de la Saga.
    - **Stripe**: Mocks del SDK para simular respuestas bancarias (éxito, denegación, error de red).
* **Validación de Contratos**: Uso de **Zod** para asegurar que los eventos que viajan por Kafka cumplen estrictamente con los esquemas compartidos en el paquete `@retrovault/shared`.
* **CI/CD con GitHub Actions**: Pipeline configurado para ejecutar tests en paralelo, garantizando que ningún cambio rompa la coreografía de la Saga.

**Ejecución de tests con pnpm:**
```bash
# Ejecutar tests de todos los servicios
pnpm test

# Ejecutar tests de todos los servicios con reporte de cobertura (v8)
pnpm test:cov
```

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

### `services/payment/.env`
```env
POSTGRES_USER=admin_payment
POSTGRES_PASSWORD=payment_pass_123
POSTGRES_DB=payment_db
PAYMENT_DB_PORT=5435
PAYMENT_DB_IP=localhost

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${PAYMENT_DB_IP}:${PAYMENT_DB_PORT}/${POSTGRES_DB}"
KAFKA_BROKERS="localhost:9092"
STRIPE_SECRET_KEY=sk_test_... # Tu clave secreta de Stripe (Test Mode)
```

## 🛡️ Validación Estricta (Fail-Fast)
El sistema utiliza **Zod** para garantizar que el entorno sea seguro antes de arrancar:
- **Variables de Entorno:** El microservicio no inicia si faltan credenciales o el formato es inválido.
- **Contratos de Eventos:** Validación de mensajes en Kafka para evitar el procesamiento de datos corruptos.

## 🏗️ Guía de Instalación y Uso
0. Preparación de variables de entorno
Antes de nada, debes crear los archivos reales a partir de las plantillas. Esto es necesario para que Docker y Prisma sepan cómo conectarse a las bases de datos:
    ```bash
    # Desde la raíz del proyecto:
    cp services/catalog/.env.example services/catalog/.env
    cp services/orders/.env.example services/orders/.env
    cp services/payment/.env.example services/payment/.env
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
4. **Configuración de Stripe**:
   Es necesario obtener una `STRIPE_SECRET_KEY` desde el Dashboard de Stripe (Developers > API Keys) y añadirla al archivo `.env` del servicio de **Payment**.
   
## 🧪 Ejecución de Tests de Integración
Para validar la comunicación bidireccional y la sincronización de stock, abre un terminal desde el root del proyecto:
```bash
pnpm dev
```
> 💡 **Tip de sincronización:** El test de Orders espera automáticamente 10 segundos. Esto garantiza que Kafka haya entregado los productos de Catalog a la base de datos de Orders antes de intentar comprar.

## 🔄 Flujo de la Saga (Coreografía)
1. **Catalog** publica productos al arrancar.
2. **Orders** sincroniza su base de datos local (Vista Materializada).
3. **Orders** publica ``order-created`` con un ``paymentMethodId`` dinámico (Success/Fail).
4. **Catalog** consume la orden y realiza una Reserva de Stock (Stock -1).
5. **Payment (Stripe SDK)** procesa el pago real:
    - **Si el token es de éxito:** Publica ``payment-completed``.
    - **Si el token es de error (fondos insuficientes):** Publica ``payment-failed``.
6. **Compensación (Saga)**:
    - **Catalog** detecta el fallo, suma +1 al stock y publica la actualización.
    - **Orders** marca la orden como ``CANCELLED``.

## 🗺️ Roadmap del Proyecto
Este proyecto sigue una evolución modular, desde la base de la comunicación asíncrona hasta la resiliencia avanzada de sistemas distribuidos.

### ✅ Fase 0: Cimientos y Comunicación (Completado)
- **Catalog Service:** Microservicio con arquitectura hexagonal para la gestión de inventario.
- **Orders Service:** Microservicio para la creación y gestión de pedidos.
- **Mensajería con Kafka:** Comunicación desacoplada entre servicios mediante eventos.
- **Persistencia Independiente:** Bases de datos PostgreSQL dedicadas por servicio con Prisma ORM.
- **Orquestación con Docker:** Entorno de desarrollo unificado con Docker Compose.

### ✅ Fase 1: Transacciones Distribuidas (Completado)
- **Payment Service:** Procesamiento financiero independiente.
- **Stripe Integration:** Uso de tokens de prueba para simular escenarios bancarios reales.
- **Patrón Saga (Coreografía):** Lógica de compensación automática funcional ante errores de terceros.
- **Consistencia Eventual**: Sincronización de stock tras fallos verificada en tiempo real.

### ✅ Fase 2: Contratos de Datos y Validación (Completado)
- **Validación con Zod:** Implementada en la carga de configuración (.env) y en los esquemas de eventos de Kafka.
- **Esquemas Compartidos:** Centralización de tipos en el paquete shared para consistencia entre servicios.

### ✅ Fase 3: Calidad y Automatización (Completado)
- **Testing de Integración (Catalog & Orders):** Uso de **Testcontainers** para pruebas reales.
- **GitHub Actions (CI):** Pipeline activo con validación de Tests y Build por cada push.
- **Testing de Integración (Payment):** Pendiente replicar la suite de Orders en los demás servicios.

### 💻 Fase 4: Seguridad y Frontend
- [ ] **API Gateway:** Punto de entrada único con ruteo inteligente.
- [ ] **Autenticación JWT:** Seguridad centralizada para proteger los recursos del sistema.
- [ ] **Frontend (Next.js):** Interfaz de usuario profesional para la navegación y compra de productos.

### 📈 Fase 5: Resiliencia y Observabilidad (Enterprise)
- [ ] **Observabilidad:** Tracing distribuido con OpenTelemetry para visualizar el viaje de cada orden.
- [ ] **Circuit Breaker:** Gestión de fallos para evitar caídas en cascada.
- [ ] **Graceful Shutdown:** Cierre de conexiones seguro para evitar pérdida de datos.

### ☁️ Fase 6: Cloud & Deployment (The Grand Finale)
- [ ] **Docker Optimization:** Multi-stage builds para reducir el tamaño de las imágenes.
- [ ] **Kubernetes Orchestration:** Configuración de clúster para manejar el auto-scaling y la auto-curación de los microservicios.
- [ ] **Continuous Deployment (CD):** Despliegue automático al clúster tras pasar la Fase 3.
- [ ] **Live Demo:** URL pública para interactuar con la versión de producción de RetroVault.
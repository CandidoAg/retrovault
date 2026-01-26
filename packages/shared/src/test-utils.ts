import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { KafkaContainer } from "@testcontainers/kafka";
import { execSync } from 'child_process';
import { Kafka, logLevel } from "kafkajs";

export type ServiceName = 'catalog' | 'orders' | 'payment' | 'auth';

export class TestHarness {
  /**
   * Inicializa Postgres, ejecuta migraciones y prepara el repositorio
   */
  static async setupPrisma(options: {
    databaseName: string,
    databaseUser: string,
    databasePassword: string,
    schemaPath: string,
    PrismaClient: any,
    PrismaRepository: any
  }) {
    const container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase(options.databaseName)
      .withUsername(options.databaseUser)
      .withPassword(options.databasePassword)
      .start();

    const dbUrl = container.getConnectionUri();
    process.env.DATABASE_URL = dbUrl;
    

    execSync(`pnpm exec prisma db push --schema="${options.schemaPath}"`, {
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: 'inherit'
    });

    const prisma = new options.PrismaClient({
      datasources: { db: { url:  dbUrl } }
    });
    
    const repository = new options.PrismaRepository();
    (repository as any).prisma = prisma;

    return { container, prisma, repository };
  }

  /**
   * Inicializa un cluster de Kafka para tests
   */
  static async setupKafka() {
    const container = await new KafkaContainer("confluentinc/cp-kafka:7.5.0")
      .withExposedPorts(9093)
      .withEnvironment({
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: "1",
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: "1",
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: "1",
        KAFKA_MIN_INSYNC_REPLICAS: "1"
      })
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(9093);
    const bootstrapServers = `${host}:${port}`;

    process.env.KAFKA_BROKERS = bootstrapServers;

    const kafka = new Kafka({
      clientId: 'test-harness-client',
      brokers: [bootstrapServers],
      logLevel: logLevel.NOTHING
    });

    return { container, bootstrapServers, kafka };
  }

  /**
   * Llena variables de entorno faltantes para que Zod no se queje
   */
  static fillEmptyEnv(service: ServiceName) {
    const dummy = {
      user: "test_user",
      pass: "test_pass",
      db: "test_db",
      ip: "localhost",
      port: "5432"
    };

    // 1. Variables Globales (Comunes a todos)
    process.env.POSTGRES_USER = process.env.POSTGRES_USER || dummy.user;
    process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || dummy.pass;
    process.env.POSTGRES_DB = process.env.POSTGRES_DB || dummy.db;
    process.env.KAFKA_BROKERS = process.env.KAFKA_BROKERS || "localhost:9092";
    
    // 2. Variables Específicas por servicio
    switch (service) {
      case 'catalog':
        process.env.CATALOG_DB_PORT = process.env.CATALOG_DB_PORT || dummy.port;
        process.env.CATALOG_DB_IP = process.env.CATALOG_DB_IP || dummy.ip;
        break;
      case 'orders':
        process.env.ORDERS_DB_PORT = process.env.ORDERS_DB_PORT || dummy.port;
        process.env.ORDERS_DB_IP = process.env.ORDERS_DB_IP || dummy.ip;
        break;
      case 'payment':
        process.env.PAYMENT_DB_PORT = process.env.PAYMENT_DB_PORT || dummy.port;
        process.env.PAYMENT_DB_IP = process.env.PAYMENT_DB_IP || dummy.ip;
        process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key";
        break;
      case 'auth':
        process.env.AUTH_DB_PORT = process.env.AUTH_DB_PORT || dummy.port;
        process.env.AUTH_DB_IP = process.env.AUTH_DB_IP || dummy.ip;
        process.env.JWT_SECRET = process.env.JWT_SECRET || "dummy_secret";
        break;
    }
  }
}
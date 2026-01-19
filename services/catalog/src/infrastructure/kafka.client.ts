import { Kafka, logLevel } from 'kafkajs';
export const kafka = new Kafka({
  clientId: 'catalog-service',
  brokers: ['localhost:9092'],
  logLevel: logLevel.NOTHING
});
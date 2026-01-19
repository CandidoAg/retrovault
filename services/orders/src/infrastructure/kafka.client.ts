import { Kafka, logLevel } from 'kafkajs';
export const kafka = new Kafka({
  clientId: 'orders-service',
  brokers: ['localhost:9092'],
  logLevel: logLevel.NOTHING
});
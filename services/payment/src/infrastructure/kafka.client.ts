import { Kafka, logLevel } from 'kafkajs';
import { env } from '../config/env.js';
export const kafka = new Kafka({
  clientId: 'payment-service',
  brokers: [env.KAFKA_BROKERS],
  logLevel: logLevel.NOTHING
});
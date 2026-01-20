import { z } from 'zod';

export const PaymentCompletedEventSchema = z.object({
  orderId: z.string().uuid(),
  transactionId: z.string(),
  amount: z.number().positive(),
  occurredAt: z.string().or(z.date())
});

export type PaymentCompletedEvent = z.infer<typeof PaymentCompletedEventSchema>;
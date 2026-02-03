import { z } from 'zod';

export const PaymentFailedEventSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string(),
  productNames: z.string(), 
});

export type PaymentFailedEvent = z.infer<typeof PaymentFailedEventSchema>;
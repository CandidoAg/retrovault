import { z } from 'zod';

export const PaymentFailedEventSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string(),
  productIds: z.array(z.string().uuid()), 
});

export type PaymentFailedEvent = z.infer<typeof PaymentFailedEventSchema>;
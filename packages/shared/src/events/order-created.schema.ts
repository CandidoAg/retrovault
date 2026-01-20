import { z } from 'zod';

export const OrderCreatedEventSchema = z.object({
  orderId: z.string().uuid(),
  total: z.number().positive(),
  paymentMethodId: z.string().optional(), // El token de Stripe
  items: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    price: z.number()
  }))
});

export type OrderCreatedEvent = z.infer<typeof OrderCreatedEventSchema>;
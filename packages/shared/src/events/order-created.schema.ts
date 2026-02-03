import { z } from 'zod';

export const OrderCreatedEventSchema = z.object({
  orderId: z.string().uuid(),
  total: z.number().positive(),
  customerName: z.string(),
  items: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    price: z.number(),
    quantity: z.number()
  }))
});

export type OrderCreatedEvent = z.infer<typeof OrderCreatedEventSchema>;
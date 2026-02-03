import { RetroProduct } from '@retrovault/shared';

export interface OrderCreatedEvent {
  orderId: string;
  customerId: string;
  total: number;
  items: RetroProduct[];
  createdAt: Date;
  customerName: string;
}
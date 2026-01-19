export interface OrderCreatedEvent {
  orderId: string;
  items: { productId: number; quantity: number }[];
}
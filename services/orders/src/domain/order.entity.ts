import { RetroProduct } from '@retrovault/shared';

export class Order {
  public readonly createdAt: Date;
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: RetroProduct[],
    public readonly status: string = 'PENDING'
  ) {
    this.createdAt = new Date();
  }

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
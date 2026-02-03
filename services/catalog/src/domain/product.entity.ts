export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public stock: number,
    public year: number,
    public brand: string,
    public description?: string,
    public rating?: number
  ) {}

  public updatePrice(newPrice: number): void {
    if (newPrice <= 0) {
      throw new Error('El precio debe ser mayor a cero');
    }
    this.price = newPrice;
  }

  public hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  public reduceStock(quantity: number): void {
    if (!this.hasStock(quantity)) {
      throw new Error(`Stock insuficiente para el producto: ${this.name}`);
    }
    this.stock -= quantity;
  }
}
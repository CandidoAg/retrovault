export class CatalogProduct {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public stock: number,
    public brand: string,
    public description?: string,
    public rating?: number
  ) {}
}
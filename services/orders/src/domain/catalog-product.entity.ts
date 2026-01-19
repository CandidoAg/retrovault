export class CatalogProduct {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public stock: number
  ) {}
}
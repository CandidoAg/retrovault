export class DeleteProductUseCase {
  constructor(private readonly productRepository: any) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new Error('El producto no existe');
    
    return await this.productRepository.delete(id);
  }
}
export class UpdateProductUseCase {
  constructor(private readonly productRepository: any) {}

  async execute(id: string, data: any) {
    // Aquí podrías validar que el nombre sea único si ha cambiado
    return await this.productRepository.update(id, data);
  }
}
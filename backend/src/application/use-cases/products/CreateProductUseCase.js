class CreateProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(productData) {
    // Validate required fields
    if (!productData.nameEn || !productData.nameEs || !productData.price) {
      throw new Error('Missing required fields');
    }

    // Create product
    const product = await this.productRepository.create(productData);
    return product;
  }
}

module.exports = CreateProductUseCase;

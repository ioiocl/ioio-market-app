const GetProductsUseCase = require('../../../application/use-cases/products/GetProductsUseCase');
const GetProductByIdUseCase = require('../../../application/use-cases/products/GetProductByIdUseCase');
const CreateProductUseCase = require('../../../application/use-cases/products/CreateProductUseCase');

class ProductController {
  constructor(productRepository) {
    this.getProductsUseCase = new GetProductsUseCase(productRepository);
    this.getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
    this.createProductUseCase = new CreateProductUseCase(productRepository);
    this.productRepository = productRepository;
  }

  async getAll(req, res) {
    try {
      const { categoryId, isActive, search, limit, offset } = req.query;
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';

      const filters = {
        categoryId,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        search,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      };

      const products = await this.getProductsUseCase.execute(filters);
      const productsJSON = products.map(p => p.toJSON(language));

      res.json({ products: productsJSON });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';

      const product = await this.getProductByIdUseCase.execute(id);
      res.json({ product: product.toJSON(language) });
    } catch (error) {
      res.status(404).json({ error: { message: error.message } });
    }
  }

  async create(req, res) {
    try {
      const productData = req.body;
      const product = await this.createProductUseCase.execute(productData);
      res.status(201).json({ product: product.toJSON() });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;
      const product = await this.productRepository.update(id, productData);
      res.json({ product: product.toJSON() });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.productRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }
}

module.exports = ProductController;

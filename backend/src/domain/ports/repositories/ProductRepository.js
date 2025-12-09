// Port (Interface) for Product Repository
class ProductRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findAll(filters) {
    throw new Error('Method not implemented');
  }

  async findByCategory(categoryId) {
    throw new Error('Method not implemented');
  }

  async create(productData) {
    throw new Error('Method not implemented');
  }

  async update(id, productData) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async updateStock(id, quantity) {
    throw new Error('Method not implemented');
  }
}

module.exports = ProductRepository;

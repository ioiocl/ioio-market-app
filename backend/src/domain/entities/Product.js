class Product {
  constructor({
    id,
    categoryId,
    nameEn,
    nameEs,
    descriptionEn,
    descriptionEs,
    price,
    stock,
    imageUrl,
    images,
    isActive,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.categoryId = categoryId;
    this.nameEn = nameEn;
    this.nameEs = nameEs;
    this.descriptionEn = descriptionEn;
    this.descriptionEs = descriptionEs;
    this.price = parseFloat(price);
    this.stock = parseInt(stock);
    this.imageUrl = imageUrl;
    this.images = images || [];
    this.isActive = isActive !== false;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isAvailable() {
    return this.isActive && this.stock > 0;
  }

  hasStock(quantity) {
    return this.stock >= quantity;
  }

  decreaseStock(quantity) {
    if (!this.hasStock(quantity)) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
  }

  toJSON(language = 'en') {
    return {
      id: this.id,
      categoryId: this.categoryId,
      name: language === 'es' ? this.nameEs : this.nameEn,
      description: language === 'es' ? this.descriptionEs : this.descriptionEn,
      price: this.price,
      stock: this.stock,
      imageUrl: this.imageUrl,
      images: this.images,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;

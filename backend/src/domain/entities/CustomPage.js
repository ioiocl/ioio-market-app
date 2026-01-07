class CustomPage {
  constructor({
    id,
    slug,
    titleEn,
    titleEs,
    contentEn,
    contentEs,
    imageUrl,
    images = [],
    isActive = true,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.slug = slug;
    this.titleEn = titleEn;
    this.titleEs = titleEs;
    this.contentEn = contentEn;
    this.contentEs = contentEs;
    this.imageUrl = imageUrl;
    this.images = images;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      titleEn: this.titleEn,
      titleEs: this.titleEs,
      contentEn: this.contentEn,
      contentEs: this.contentEs,
      imageUrl: this.imageUrl,
      images: this.images,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = CustomPage;

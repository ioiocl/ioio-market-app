class CategoryController {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async getAll(req, res) {
    try {
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';
      const categories = await this.categoryRepository.findAll();
      
      const categoriesJSON = categories.map(cat => ({
        id: cat.id,
        name: language === 'es' ? cat.name_es : cat.name_en,
        slug: cat.slug,
        description: language === 'es' ? cat.description_es : cat.description_en,
        imageUrl: cat.image_url,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at
      }));

      res.json({ categories: categoriesJSON });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';
      const category = await this.categoryRepository.findById(id);

      if (!category) {
        return res.status(404).json({ error: { message: 'Category not found' } });
      }

      res.json({
        category: {
          id: category.id,
          name: language === 'es' ? category.name_es : category.name_en,
          slug: category.slug,
          description: language === 'es' ? category.description_es : category.description_en,
          imageUrl: category.image_url
        }
      });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async create(req, res) {
    try {
      const category = await this.categoryRepository.create(req.body);
      res.status(201).json({ category });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const category = await this.categoryRepository.update(id, req.body);
      res.json({ category });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.categoryRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }
}

module.exports = CategoryController;

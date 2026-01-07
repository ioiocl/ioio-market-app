class CustomPageController {
  constructor(customPageRepository) {
    this.customPageRepository = customPageRepository;
  }

  async getAll(req, res) {
    try {
      const pages = await this.customPageRepository.findAll();
      res.json({ pages: pages.map(p => p.toJSON()) });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const page = await this.customPageRepository.findBySlug(slug);

      if (!page) {
        return res.status(404).json({ error: { message: 'Page not found' } });
      }

      res.json({ page: page.toJSON() });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const page = await this.customPageRepository.findById(id);

      if (!page) {
        return res.status(404).json({ error: { message: 'Page not found' } });
      }

      res.json({ page: page.toJSON() });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async create(req, res) {
    try {
      const pageData = req.body;
      const page = await this.customPageRepository.create(pageData);
      res.status(201).json({ page: page.toJSON() });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const pageData = req.body;
      const page = await this.customPageRepository.update(id, pageData);
      res.json({ page: page.toJSON() });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.customPageRepository.delete(id);
      res.json({ message: 'Page deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }
}

module.exports = CustomPageController;

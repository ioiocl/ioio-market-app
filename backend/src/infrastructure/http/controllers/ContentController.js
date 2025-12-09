// Controller for Banners, Events, Experiments, and Company Info
class ContentController {
  constructor(bannerRepository, eventRepository, experimentRepository, companyInfoRepository) {
    this.bannerRepository = bannerRepository;
    this.eventRepository = eventRepository;
    this.experimentRepository = experimentRepository;
    this.companyInfoRepository = companyInfoRepository;
  }

  // Banners
  async getBanners(req, res) {
    try {
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';
      const activeOnly = req.query.active !== 'false';
      const banners = await this.bannerRepository.findAll(activeOnly);
      
      const bannersJSON = banners.map(banner => ({
        id: banner.id,
        title: language === 'es' ? banner.title_es : banner.title_en,
        imageUrl: banner.image_url,
        linkUrl: banner.link_url,
        displayOrder: banner.display_order,
        isActive: banner.is_active
      }));

      res.json({ banners: bannersJSON });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async createBanner(req, res) {
    try {
      const banner = await this.bannerRepository.create(req.body);
      res.status(201).json({ banner });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async updateBanner(req, res) {
    try {
      const { id } = req.params;
      const banner = await this.bannerRepository.update(id, req.body);
      res.json({ banner });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async deleteBanner(req, res) {
    try {
      const { id } = req.params;
      await this.bannerRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  // Events
  async getEvents(req, res) {
    try {
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';
      const activeOnly = req.query.active !== 'false';
      const events = await this.eventRepository.findAll(activeOnly);
      
      const eventsJSON = events.map(event => ({
        id: event.id,
        title: language === 'es' ? event.title_es : event.title_en,
        description: language === 'es' ? event.description_es : event.description_en,
        eventDate: event.event_date,
        location: event.location,
        imageUrl: event.image_url,
        isActive: event.is_active
      }));

      res.json({ events: eventsJSON });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async getEventById(req, res) {
    try {
      const { id } = req.params;
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';
      const event = await this.eventRepository.findById(id);

      if (!event) {
        return res.status(404).json({ error: { message: 'Event not found' } });
      }

      res.json({
        event: {
          id: event.id,
          title: language === 'es' ? event.title_es : event.title_en,
          description: language === 'es' ? event.description_es : event.description_en,
          eventDate: event.event_date,
          location: event.location,
          imageUrl: event.image_url
        }
      });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async createEvent(req, res) {
    try {
      const event = await this.eventRepository.create(req.body);
      res.status(201).json({ event });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await this.eventRepository.update(id, req.body);
      res.json({ event });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      await this.eventRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  // Experiments
  async getExperiments(req, res) {
    try {
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';
      const activeOnly = req.query.active !== 'false';
      const experiments = await this.experimentRepository.findAll(activeOnly);
      
      const experimentsJSON = experiments.map(exp => ({
        id: exp.id,
        title: language === 'es' ? exp.title_es : exp.title_en,
        description: language === 'es' ? exp.description_es : exp.description_en,
        content: language === 'es' ? exp.content_es : exp.content_en,
        imageUrl: exp.image_url,
        images: exp.images,
        isActive: exp.is_active
      }));

      res.json({ experiments: experimentsJSON });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async getExperimentById(req, res) {
    try {
      const { id } = req.params;
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';
      const experiment = await this.experimentRepository.findById(id);

      if (!experiment) {
        return res.status(404).json({ error: { message: 'Experiment not found' } });
      }

      res.json({
        experiment: {
          id: experiment.id,
          title: language === 'es' ? experiment.title_es : experiment.title_en,
          description: language === 'es' ? experiment.description_es : experiment.description_en,
          content: language === 'es' ? experiment.content_es : experiment.content_en,
          imageUrl: experiment.image_url,
          images: experiment.images
        }
      });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async createExperiment(req, res) {
    try {
      const experiment = await this.experimentRepository.create(req.body);
      res.status(201).json({ experiment });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async updateExperiment(req, res) {
    try {
      const { id } = req.params;
      const experiment = await this.experimentRepository.update(id, req.body);
      res.json({ experiment });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async deleteExperiment(req, res) {
    try {
      const { id } = req.params;
      await this.experimentRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  // Company Info
  async getCompanyInfo(req, res) {
    try {
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';
      const companyInfo = await this.companyInfoRepository.get();

      if (!companyInfo) {
        return res.status(404).json({ error: { message: 'Company info not found' } });
      }

      res.json({
        companyInfo: {
          about: language === 'es' ? companyInfo.about_es : companyInfo.about_en,
          contactEmail: companyInfo.contact_email,
          contactPhone: companyInfo.contact_phone,
          address: companyInfo.address,
          socialMedia: companyInfo.social_media
        }
      });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async updateCompanyInfo(req, res) {
    try {
      const companyInfo = await this.companyInfoRepository.update(req.body);
      res.json({ companyInfo });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }
}

module.exports = ContentController;

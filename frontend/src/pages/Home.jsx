import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { bannerService, productService, categoryService, eventService, experimentService } from '../api/services';
import HtmlContent from '../components/HtmlContent';

function Home() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [events, setEvents] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bannersRes, categoriesRes, eventsRes, experimentsRes] = await Promise.all([
        bannerService.getAll(),
        categoryService.getAll(),
        eventService.getAll(),
        experimentService.getAll(),
      ]);

      setBanners(bannersRes.data.banners);
      setCategories(categoriesRes.data.categories);
      setEvents(eventsRes.data.events.slice(0, 2));
      setExperiments(experimentsRes.data.experiments.slice(0, 2));

      // Load products for each category
      const productsData = {};
      for (const category of categoriesRes.data.categories) {
        const productsRes = await productService.getAll({ categoryId: category.id, limit: 6 });
        productsData[category.id] = productsRes.data.products;
      }
      setProductsByCategory(productsData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl neon-text loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Chess Tournament Hero Section */}
      <section className="relative overflow-hidden bg-cyber-dark">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Tournament Image */}
            <div className="relative rounded-lg overflow-hidden mb-8 shadow-2xl">
              <img
                src="/chess-tournament.png"
                alt="Cuarto Torneo de Ajedrez IOIO"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Tournament Description */}
            <div className="bg-cyber-black bg-opacity-50 rounded-lg p-8 border border-cyber-blue border-opacity-30">
              <p className="text-lg md:text-xl leading-relaxed text-gray-200">
                Este domingo 27 de diciembre desde las 18:00 hrs, te invitamos a vivir una tarde distinta, 
                llena de estrategia, camaradería y riesgo controlado en el Cuarto Campeonato de Ajedrez IOIO.
              </p>
              <p className="text-lg md:text-xl leading-relaxed text-gray-200 mt-4">
                Ven a poner a prueba tu mente, conocer a otros amantes del ajedrez y disfrutar de un ambiente 
                creativo y colaborativo en el cowork IOIO, ubicado en Abtao 576, Cerro Concepción, Valparaíso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="bg-cyber-dark py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-cyber-pink">{t('events.title')}</h2>
            <Link
              to="/events"
              className="flex items-center space-x-2 text-cyber-pink hover:text-cyber-blue transition-colors"
            >
              <span>{t('events.learnMore')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="cyber-card rounded-lg overflow-hidden group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <div className="text-gray-400 mb-4 line-clamp-2">
                    <HtmlContent html={event.description} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyber-blue">{event.location}</span>
                    <span className="text-gray-500">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Experiments Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-cyber-yellow">{t('experiments.title')}</h2>
          <Link
            to="/experiments"
            className="flex items-center space-x-2 text-cyber-yellow hover:text-cyber-blue transition-colors"
          >
            <span>{t('experiments.readMore')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {experiments.map((experiment) => (
            <Link
              key={experiment.id}
              to={`/experiments/${experiment.id}`}
              className="cyber-card rounded-lg overflow-hidden group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={experiment.imageUrl}
                  alt={experiment.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{experiment.title}</h3>
                <div className="text-gray-400 line-clamp-3">
                  <HtmlContent html={experiment.description} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;

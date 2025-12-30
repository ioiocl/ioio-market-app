import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingCart } from 'lucide-react';
import { bannerService, productService, categoryService, eventService, experimentService } from '../api/services';
import HtmlContent from '../components/HtmlContent';

function Home() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [shopProducts, setShopProducts] = useState([]);
  const [shopCategoryIds, setShopCategoryIds] = useState([]);
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
      const allCategories = categoriesRes.data.categories;
      
      // Identify shop categories (Merchandising and Clothes)
      const shopCategories = allCategories.filter(cat => 
        cat.name?.toLowerCase().includes('merchandising') ||
        cat.name?.toLowerCase().includes('clothes') ||
        cat.name?.toLowerCase().includes('ropa') ||
        cat.name_en?.toLowerCase().includes('merchandising') ||
        cat.name_en?.toLowerCase().includes('clothes') ||
        cat.name_es?.toLowerCase().includes('merchandising') ||
        cat.name_es?.toLowerCase().includes('ropa')
      );
      
      const shopCatIds = shopCategories.map(c => c.id);
      setShopCategoryIds(shopCatIds);
      
      // Filter out shop categories from regular display
      const otherCategories = allCategories.filter(cat => !shopCatIds.includes(cat.id));
      setCategories(otherCategories);
      setEvents(eventsRes.data.events.slice(0, 2));
      setExperiments(experimentsRes.data.experiments.slice(0, 2));

      // Load shop products (combined from merchandising and clothes, first 6 total)
      if (shopCatIds.length > 0) {
        const shopProductsRes = await productService.getAll({ limit: 100 });
        const filteredShopProducts = shopProductsRes.data.products
          .filter(p => shopCatIds.includes(p.categoryId || p.category_id))
          .slice(0, 6);
        setShopProducts(filteredShopProducts);
      }

      // Load products for other categories
      const productsData = {};
      for (const category of otherCategories) {
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
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          {/* Shopping Cart Icon */}
          <Link
            to="/cart"
            className="absolute top-4 right-4 z-10 p-3 bg-cyber-blue text-cyber-black rounded-full hover:bg-cyber-pink transition-all shadow-lg hover:scale-110"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
          </Link>

          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                <h2 className="text-4xl md:text-6xl font-bold mb-4 neon-text">
                  {banner.title}
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-6">
                  {banner.description}
                </p>
                {banner.link && (
                  <Link
                    to={banner.link}
                    className="inline-block px-8 py-3 bg-cyber-blue text-cyber-black font-bold rounded-lg hover:bg-cyber-pink transition-colors"
                  >
                    {t('home.shopNow')}
                  </Link>
                )}
              </div>
            </div>
          ))}

          {/* Navigation Buttons */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-cyber-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-8 h-8 text-cyber-blue" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-cyber-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
                aria-label="Next banner"
              >
                <ChevronRight className="w-8 h-8 text-cyber-blue" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentBanner
                        ? 'bg-cyber-blue w-8'
                        : 'bg-gray-500 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Shop Section (Merchandising + Clothes) */}
      {shopProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-cyber-blue">Shop</h2>
            <Link
              to={`/products?shop=true`}
              className="flex items-center space-x-2 text-cyber-blue hover:text-cyber-pink transition-colors"
            >
              <span>{t('products.viewAll') || 'Ver Todo'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {shopProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="cyber-card rounded-lg overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  {(() => {
                    const primaryImage = (product.images && product.images[0]) || product.imageUrl;
                    return (
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    );
                  })()}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                      <span className="text-cyber-pink font-bold text-sm">
                        {t('products.outOfStock')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 truncate text-sm">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-cyber-blue font-bold">
                      ${product.price}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t('products.stock')}: {product.stock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products by Category */}
      {categories.map((category) => {
        const products = productsByCategory[category.id] || [];
        if (products.length === 0) return null;

        return (
          <section key={category.id} className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-cyber-blue">{category.name}</h2>
              <Link
                to={`/products?category=${category.id}`}
                className="flex items-center space-x-2 text-cyber-blue hover:text-cyber-pink transition-colors"
              >
                <span>{t('products.viewDetails')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="cyber-card rounded-lg overflow-hidden group"
                >
                  <div className="relative h-48 overflow-hidden">
                    {(() => {
                      const primaryImage = (product.images && product.images[0]) || product.imageUrl;
                      return (
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      );
                    })()}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                        <span className="text-cyber-pink font-bold text-sm">
                          {t('products.outOfStock')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 truncate text-sm">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-cyber-blue font-bold">
                        ${product.price}
                      </span>
                      <span className="text-xs text-gray-500">
                        {t('products.stock')}: {product.stock}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* Events Section */}
      {events.length > 0 && (
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
      )}

      {/* Experiments Section */}
      {experiments.length > 0 && (
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
      )}
    </div>
  );
}

export default Home;

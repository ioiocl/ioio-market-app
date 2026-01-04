import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { productService, categoryService } from '../api/services';

function Products() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shopCategoryIds, setShopCategoryIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [isShopView, setIsShopView] = useState(searchParams.get('shop') === 'true');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const shopParam = searchParams.get('shop');
    setIsShopView(shopParam === 'true');
    if (shopParam === 'true') {
      setSelectedCategory('');
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, isShopView]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll();
      const allCategories = res.data.categories;
      
      // Identify shop categories
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
      
      // Filter out shop categories from sidebar
      const otherCategories = allCategories.filter(cat => !shopCatIds.includes(cat.id));
      setCategories(otherCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      if (isShopView && shopCategoryIds.length > 0) {
        // Load all products and filter by shop categories
        const res = await productService.getAll({});
        const shopProducts = res.data.products.filter(p => 
          shopCategoryIds.includes(p.categoryId || p.category_id)
        );
        setProducts(shopProducts);
      } else {
        // Normal category filtering
        const params = selectedCategory ? { categoryId: selectedCategory } : {};
        const res = await productService.getAll(params);
        setProducts(res.data.products);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsShopView(false);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const handleShopView = () => {
    setIsShopView(true);
    setSelectedCategory('');
    setSearchParams({ shop: 'true' });
  };

  // Auto-rotate slider
  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % products.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [products]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  return (
    <div className="min-h-screen">
      {/* Product Slider */}
      {products.length > 0 && (
        <section className="relative h-96 md:h-[500px] overflow-hidden mb-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {(() => {
                const primaryImage = (product.images && product.images[0]) || product.imageUrl;
                return (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                <h2 className="text-4xl md:text-6xl font-bold mb-4 neon-text">
                  {product.name}
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-6 line-clamp-3 max-w-4xl mx-auto">
                  {product.description}
                </p>
                <Link
                  to={`/products/${product.id}`}
                  className="inline-block px-8 py-3 bg-cyber-blue text-cyber-black font-bold rounded-lg hover:bg-cyber-pink transition-colors"
                >
                  VER
                </Link>
              </div>
            </div>
          ))}

          {/* Navigation Buttons */}
          {products.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-cyber-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all z-10"
                aria-label="Previous product"
              >
                <ChevronLeft className="w-8 h-8 text-cyber-blue" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-cyber-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all z-10"
                aria-label="Next product"
              >
                <ChevronRight className="w-8 h-8 text-cyber-blue" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-cyber-blue w-8'
                        : 'bg-gray-500 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to product ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 neon-text">{t('products.title')}</h1>

        <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - Categories */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="cyber-card rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-cyber-blue">{t('products.categories')}</h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={handleShopView}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    isShopView
                      ? 'bg-cyber-blue text-cyber-black'
                      : 'hover:bg-cyber-gray'
                  }`}
                >
                  Shop
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    !selectedCategory && !isShopView
                      ? 'bg-cyber-blue text-cyber-black'
                      : 'hover:bg-cyber-gray'
                  }`}
                >
                  {t('products.allProducts')}
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-cyber-blue text-cyber-black'
                        : 'hover:bg-cyber-gray'
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20">
              <div className="text-2xl neon-text loading">{t('common.loading')}</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="cyber-card rounded-lg overflow-hidden group"
                >
                  <div className="relative h-64 overflow-hidden">
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
                        <span className="text-cyber-pink font-bold text-lg">
                          {t('products.outOfStock')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 truncate">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-cyber-blue font-bold text-lg">
                        ${product.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {t('products.stock')}: {product.stock}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default Products;

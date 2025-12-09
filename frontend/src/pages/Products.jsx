import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService, categoryService } from '../api/services';

function Products() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = selectedCategory ? { categoryId: selectedCategory } : {};
      const res = await productService.getAll(params);
      setProducts(res.data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  return (
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
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    !selectedCategory
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
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
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
  );
}

export default Products;

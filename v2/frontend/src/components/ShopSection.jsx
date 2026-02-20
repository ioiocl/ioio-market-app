import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Package } from 'lucide-react';
import { useProductsStore } from '../store/productsStore';

export default function ShopSection() {
  const { t } = useTranslation();
  const { products, fetchProducts } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <section id="shop" className="py-20 bg-gray-50">
      <div className="container">
        <h2 className="text-4xl font-bold text-center mb-12">{t('shop.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="card">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('shop.price')}:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${product.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{t('shop.sku')}:</span>
                    <span className="font-mono">{product.sku}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{t('shop.stock')}:</span>
                    <span className={product.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.quantity > 0 ? `${product.quantity} unidades` : t('shop.outOfStock')}
                    </span>
                  </div>
                </div>
                
                <button
                  disabled={product.quantity === 0}
                  className={`btn w-full ${
                    product.quantity > 0 ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.quantity > 0 ? t('shop.addToCart') : t('shop.outOfStock')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

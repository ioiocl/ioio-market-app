import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { productService, cartService } from '../api/services';
import useStore from '../store/useStore';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setCart } = useStore();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await productService.getById(id);
      setProduct(res.data.product);
      setLoading(false);
    } catch (error) {
      console.error('Error loading product:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await cartService.addItem(product.id, quantity);
      const cartRes = await cartService.get();
      setCart(cartRes.data.cart);
      alert(t('products.addToCart') + ' ✓');
      setAdding(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl neon-text loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl text-gray-400">Product not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="cyber-card rounded-lg overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-auto"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4 neon-text">{product.name}</h1>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-cyber-blue">${product.price}</span>
          </div>

          <div className="mb-6">
            <span className="text-gray-400">
              {t('products.stock')}: <span className="text-white">{product.stock}</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-cyber-blue">
              {t('products.description')}
            </h2>
            <p className="text-gray-300 leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                {t('cart.quantity')}
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 bg-cyber-gray hover:bg-cyber-blue rounded transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 bg-cyber-gray hover:bg-cyber-blue rounded transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="cyber-button w-full flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{adding ? t('common.loading') : t('products.addToCart')}</span>
            </button>
          ) : (
            <div className="w-full py-4 bg-cyber-gray text-center rounded text-gray-400">
              {t('products.outOfStock')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

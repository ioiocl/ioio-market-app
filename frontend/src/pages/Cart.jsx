import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, ShoppingBag } from 'lucide-react';
import { cartService } from '../api/services';
import useStore from '../store/useStore';

function Cart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, setCart, user } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await cartService.get();
      setCart(res.data.cart);
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeItem(itemId);
      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl neon-text loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-600" />
        <h1 className="text-3xl font-bold mb-4">{t('cart.empty')}</h1>
        <Link to="/products" className="cyber-button inline-block">
          {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 neon-text">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="cyber-card rounded-lg p-6 flex items-center space-x-6">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-24 object-cover rounded"
              />
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-cyber-blue font-bold">${item.price}</p>
                <p className="text-sm text-gray-400">
                  {t('cart.quantity')}: {item.quantity}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-cyber-blue mb-4">
                  ${item.subtotal.toFixed(2)}
                </p>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 bg-cyber-pink hover:bg-opacity-80 rounded transition-colors"
                  title={t('cart.remove')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="cyber-card rounded-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 text-cyber-blue">
              {t('checkout.orderSummary')}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">{t('cart.subtotal')}</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('cart.tax')}</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('cart.shipping')}</span>
                <span className="font-semibold">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {subtotal < 100 && (
                <p className="text-xs text-cyber-yellow">{t('cart.freeShipping')}</p>
              )}
              <div className="border-t border-cyber-gray pt-4">
                <div className="flex justify-between text-xl">
                  <span className="font-bold">{t('cart.total')}</span>
                  <span className="font-bold text-cyber-blue">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="cyber-button w-full mb-4"
            >
              {t('cart.checkout')}
            </button>

            <Link
              to="/products"
              className="block text-center text-cyber-blue hover:text-cyber-pink transition-colors"
            >
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;

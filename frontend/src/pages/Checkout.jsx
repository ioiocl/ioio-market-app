import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, Bitcoin } from 'lucide-react';
import { cartService, orderService } from '../api/services';
import useStore from '../store/useStore';

function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, cart, setCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await cartService.get();
      setCart(res.data.cart);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        paymentMethod,
        shippingAddress: formData,
      };

      const res = await orderService.create(orderData);
      alert('Order placed successfully! Order #' + res.data.order.orderNumber);
      
      // Clear cart
      setCart({ items: [], total: 0 });
      navigate('/');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error placing order: ' + (error.response?.data?.error?.message || error.message));
      setLoading(false);
    }
  };

  const subtotal = cart.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 neon-text">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="cyber-card rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-cyber-blue">
              {t('checkout.shippingAddress')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t('checkout.firstName')}
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t('checkout.lastName')}
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  {t('checkout.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  {t('checkout.address')}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t('checkout.city')}
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t('checkout.country')}
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  {t('checkout.zipCode')}
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="cyber-card rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-cyber-blue">
              {t('checkout.paymentMethod')}
            </h2>

            <div className="space-y-4">
              <label className="flex items-center p-4 border-2 border-cyber-gray rounded cursor-pointer hover:border-cyber-blue transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mercadopago"
                  checked={paymentMethod === 'mercadopago'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4"
                />
                <CreditCard className="w-6 h-6 mr-3 text-cyber-blue" />
                <span className="font-semibold">{t('checkout.mercadopago')}</span>
              </label>

              <label className="flex items-center p-4 border-2 border-cyber-gray rounded cursor-pointer hover:border-cyber-blue transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="btc"
                  checked={paymentMethod === 'btc'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4"
                />
                <Bitcoin className="w-6 h-6 mr-3 text-cyber-yellow" />
                <span className="font-semibold">{t('checkout.bitcoin')}</span>
              </label>

              <label className="flex items-center p-4 border-2 border-cyber-gray rounded cursor-pointer hover:border-cyber-blue transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="eth"
                  checked={paymentMethod === 'eth'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4"
                />
                <Bitcoin className="w-6 h-6 mr-3 text-cyber-pink" />
                <span className="font-semibold">{t('checkout.ethereum')}</span>
              </label>
            </div>
          </div>
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
              <div className="border-t border-cyber-gray pt-4">
                <div className="flex justify-between text-xl">
                  <span className="font-bold">{t('cart.total')}</span>
                  <span className="font-bold text-cyber-blue">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-button w-full"
            >
              {loading ? t('common.loading') : t('checkout.placeOrder')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Checkout;

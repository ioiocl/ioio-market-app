import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { orderService } from '../api/services';

function OrderFailure() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      loadOrder(orderId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const loadOrder = async (orderId) => {
    try {
      const res = await orderService.getById(orderId);
      setOrder(res.data.order);
      console.log('Order loaded:', res.data.order);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyber-blue mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-4xl font-bold mb-4 text-red-500">
          {t('order.failure.title', 'Payment Failed')}
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          {t('order.failure.message', 'Unfortunately, your payment could not be processed. Please try again.')}
        </p>

        {order && (
          <div className="cyber-card rounded-lg p-6 mb-8 text-left">
            <h2 className="text-2xl font-bold mb-4 text-cyber-blue">
              {t('order.details', 'Order Details')}
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">{t('order.number', 'Order Number')}:</span>
                <span className="font-semibold">{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">{t('order.paymentStatus', 'Payment Status')}:</span>
                <span className="font-semibold capitalize text-red-500">{order.paymentStatus}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">{t('order.total', 'Total')}:</span>
                <span className="font-semibold text-xl">${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-x-4">
          <button
            onClick={() => navigate('/checkout')}
            className="cyber-button"
          >
            {t('order.tryAgain', 'Try Again')}
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="cyber-button-secondary"
          >
            {t('common.backToHome', 'Back to Home')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderFailure;

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../api/services';

function AdminOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await orderService.getAll();
      setOrders(res.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-2xl neon-text loading">{t('common.loading')}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 neon-text">{t('admin.orders')}</h1>
      <div className="cyber-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-cyber-gray">
            <tr>
              <th className="px-6 py-3 text-left">Order #</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-cyber-gray">
                <td className="px-6 py-4">{order.orderNumber}</td>
                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">${order.total}</td>
                <td className="px-6 py-4">{order.status}</td>
                <td className="px-6 py-4">{order.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;

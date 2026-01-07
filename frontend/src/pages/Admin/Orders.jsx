import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle } from 'lucide-react';
import { orderService } from '../../api/services';

function AdminOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      await orderService.updateStatus(orderId, newStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      alert('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar el estado: ' + (error.response?.data?.error?.message || error.message));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-2xl neon-text loading">{t('common.loading')}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 neon-text">{t('admin.orders')}</h1>
      
      {orders.length === 0 ? (
        <div className="cyber-card rounded-lg p-12 text-center">
          <p className="text-xl text-gray-400">No hay órdenes todavía</p>
        </div>
      ) : (
        <div className="cyber-card rounded-lg overflow-x-auto">
          <table className="w-full min-w-max">
          <thead className="bg-cyber-gray">
            <tr>
              <th className="px-6 py-3 text-left">Order #</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Payment Method</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Payment Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isPending = order.status === 'pending';
              const isUpdating = updatingOrderId === order.id;
              
              return (
                <tr key={order.id} className="border-t border-cyber-gray hover:bg-cyber-gray hover:bg-opacity-30 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{order.orderNumber}</td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-cyber-blue">${order.total}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-cyber-gray uppercase">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'approved' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                      order.status === 'rejected' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                      'bg-yellow-500 bg-opacity-20 text-yellow-400'
                    }`}>
                      {order.status === 'approved' ? 'Aprobada' :
                       order.status === 'rejected' ? 'Rechazada' :
                       'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.paymentStatus === 'paid' ? 'bg-cyber-green bg-opacity-20 text-cyber-green' :
                      'bg-cyber-pink bg-opacity-20 text-cyber-pink'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isPending ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'approved')}
                          disabled={isUpdating}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 bg-opacity-20 text-green-400 rounded hover:bg-opacity-30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Aprobar orden"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-semibold">Aprobar</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'rejected')}
                          disabled={isUpdating}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 bg-opacity-20 text-red-400 rounded hover:bg-opacity-30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Rechazar orden"
                        >
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs font-semibold">Rechazar</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {order.status === 'approved' ? '✓ Aprobada' : '✗ Rechazada'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;

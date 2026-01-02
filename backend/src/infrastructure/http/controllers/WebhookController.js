const MercadoPagoService = require('../../services/MercadoPagoService');

class WebhookController {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
    this.mercadoPagoService = new MercadoPagoService();
  }
  async handleMercadoPago(req, res) {
    try {
      console.log('MercadoPago webhook received:', JSON.stringify(req.body, null, 2));
      console.log('Query params:', req.query);

      const { topic, resource } = req.body;
      const { type, data } = req.body;

      // Acknowledge receipt immediately
      res.status(200).send('OK');

      // Process the notification asynchronously
      if (type === 'payment' || topic === 'payment') {
        const paymentId = data?.id || req.query.id;
        if (paymentId) {
          const paymentInfo = await this.mercadoPagoService.processWebhookNotification({ 
            type: 'payment', 
            data: { id: paymentId } 
          });
          
          if (paymentInfo) {
            console.log('Payment info:', paymentInfo);

            // Update order payment status
            const paymentStatus = this._mapPaymentStatus(paymentInfo.status);
            await this.orderRepository.updatePaymentStatus(
              paymentInfo.orderId,
              paymentStatus,
              {
                paymentId: paymentInfo.paymentId,
                status: paymentInfo.status,
                statusDetail: paymentInfo.statusDetail,
                amount: paymentInfo.amount,
                paymentMethod: paymentInfo.paymentMethod,
                paidAt: paymentInfo.paidAt
              }
            );

            console.log(`Order ${paymentInfo.orderId} payment status updated to: ${paymentStatus}`);
          }
        }
      } else if (topic === 'merchant_order') {
        console.log('Merchant order notification received - payment may be processed via payment topic');
      }
    } catch (error) {
      console.error('Webhook error:', error);
      // Still return 200 to avoid retries
      res.status(200).send('OK');
    }
  }

  _mapPaymentStatus(mpStatus) {
    const statusMap = {
      'approved': 'paid',
      'pending': 'pending',
      'in_process': 'pending',
      'rejected': 'failed',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'charged_back': 'refunded'
    };
    return statusMap[mpStatus] || 'pending';
  }
}

module.exports = WebhookController;

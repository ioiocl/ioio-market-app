const mercadopago = require('mercadopago');

class MercadoPagoService {
  constructor() {
    // Initialize MercadoPago with access token
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });
  }

  async createPaymentPreference(order) {
    try {
      const items = order.items.map(item => ({
        title: item.productName,
        unit_price: parseFloat(item.price),
        quantity: item.quantity,
        currency_id: 'CLP' // Chilean Peso
      }));

      const preference = {
        items: items,
        payer: {
          name: order.shippingAddress.firstName,
          surname: order.shippingAddress.lastName,
          email: order.shippingAddress.email
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'https://ioio.cl'}/order-success?orderId=${order.id}`,
          failure: `${process.env.FRONTEND_URL || 'https://ioio.cl'}/order-failure?orderId=${order.id}`,
          pending: `${process.env.FRONTEND_URL || 'https://ioio.cl'}/order-pending?orderId=${order.id}`
        },
        auto_return: 'approved',
        external_reference: order.id,
        notification_url: `${process.env.BACKEND_URL || 'https://api.ioio.cl/api'}/webhooks/mercadopago`,
        statement_descriptor: 'IOIO',
        payment_methods: {
          excluded_payment_types: [],
          installments: 12
        }
      };

      const response = await mercadopago.preferences.create(preference);
      
      return {
        id: response.body.id,
        init_point: response.body.init_point, // URL for web
        sandbox_init_point: response.body.sandbox_init_point // URL for testing
      };
    } catch (error) {
      console.error('MercadoPago error:', error);
      throw new Error(`Failed to create payment preference: ${error.message}`);
    }
  }

  async getPaymentInfo(paymentId) {
    try {
      const payment = await mercadopago.payment.get(paymentId);
      return payment.body;
    } catch (error) {
      console.error('Error getting payment info:', error);
      throw new Error(`Failed to get payment info: ${error.message}`);
    }
  }

  async processWebhookNotification(data) {
    try {
      if (data.type === 'payment') {
        const paymentInfo = await this.getPaymentInfo(data.data.id);
        
        return {
          orderId: paymentInfo.external_reference,
          paymentId: paymentInfo.id,
          status: paymentInfo.status,
          statusDetail: paymentInfo.status_detail,
          amount: paymentInfo.transaction_amount,
          paymentMethod: paymentInfo.payment_method_id,
          paidAt: paymentInfo.date_approved
        };
      }
      return null;
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }
}

module.exports = MercadoPagoService;

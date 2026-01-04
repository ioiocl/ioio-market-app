const CreateOrderUseCase = require('../../../application/use-cases/orders/CreateOrderUseCase');
const MercadoPagoService = require('../../services/MercadoPagoService');

class OrderController {
  constructor(orderRepository, productRepository, cartRepository) {
    this.createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      productRepository,
      cartRepository
    );
    this.orderRepository = orderRepository;
    this.mercadoPagoService = new MercadoPagoService();
  }

  async create(req, res) {
    try {
      const userId = req.user.userId;
      const orderData = req.body;

      console.log('=== ORDER CREATION START ===');
      console.log('User ID:', userId);
      console.log('Payment Method:', orderData.paymentMethod);
      console.log('Order data:', JSON.stringify(orderData, null, 2));

      const order = await this.createOrderUseCase.execute(userId, orderData);
      console.log('Order created successfully:', order.id);
      
      // If payment method is MercadoPago, create payment preference
      let paymentUrl = null;
      if (orderData.paymentMethod === 'mercadopago') {
        console.log('=== MERCADOPAGO PAYMENT CREATION START ===');
        console.log('Access Token configured:', !!process.env.MERCADOPAGO_ACCESS_TOKEN);
        console.log('Frontend URL:', process.env.FRONTEND_URL || 'https://ioio.cl');
        console.log('Backend URL:', process.env.BACKEND_URL || 'https://api.ioio.cl/api');
        
        try {
          const preference = await this.mercadoPagoService.createPaymentPreference(order);
          paymentUrl = preference.init_point;
          
          console.log('MercadoPago preference created successfully:');
          console.log('- Preference ID:', preference.id);
          console.log('- Payment URL:', paymentUrl);
          
          // Update order with payment details
          await this.orderRepository.updatePaymentDetails(order.id, {
            preferenceId: preference.id,
            paymentUrl: paymentUrl
          });
          
          console.log('Order payment details updated');
          console.log('=== MERCADOPAGO PAYMENT CREATION SUCCESS ===');
        } catch (mpError) {
          console.error('=== MERCADOPAGO PAYMENT CREATION FAILED ===');
          console.error('Error type:', mpError.constructor.name);
          console.error('Error message:', mpError.message);
          console.error('Error stack:', mpError.stack);
          if (mpError.response) {
            console.error('API Response Status:', mpError.response.status);
            console.error('API Response Data:', JSON.stringify(mpError.response.data, null, 2));
          }
          
          // CRITICAL: Fail the order creation if MercadoPago fails
          throw new Error(`MercadoPago payment creation failed: ${mpError.message}`);
        }
      }
      
      console.log('=== ORDER CREATION SUCCESS ===');
      res.status(201).json({ 
        order: order.toJSON(),
        paymentUrl: paymentUrl 
      });
    } catch (error) {
      console.error('=== ORDER CREATION FAILED ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async getMyOrders(req, res) {
    try {
      const userId = req.user.userId;
      const orders = await this.orderRepository.findByUserId(userId);
      res.json({ orders: orders.map(o => o.toJSON()) });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await this.orderRepository.findById(id);

      if (!order) {
        return res.status(404).json({ error: { message: 'Order not found' } });
      }

      // Check if user owns the order or is admin
      if (order.userId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: { message: 'Access denied' } });
      }

      res.json({ order: order.toJSON() });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async getAll(req, res) {
    try {
      const { status, paymentStatus, limit, offset } = req.query;

      const filters = {
        status,
        paymentStatus,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      };

      const orders = await this.orderRepository.findAll(filters);
      res.json({ orders: orders.map(o => o.toJSON()) });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: { message: 'Status is required' } });
      }

      const order = await this.orderRepository.updateStatus(id, status);
      res.json({ order: order.toJSON() });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }
}

module.exports = OrderController;

const CreateOrderUseCase = require('../../../application/use-cases/orders/CreateOrderUseCase');

class OrderController {
  constructor(orderRepository, productRepository, cartRepository) {
    this.createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      productRepository,
      cartRepository
    );
    this.orderRepository = orderRepository;
  }

  async create(req, res) {
    try {
      const userId = req.user.userId;
      const orderData = req.body;

      const order = await this.createOrderUseCase.execute(userId, orderData);
      res.status(201).json({ order: order.toJSON() });
    } catch (error) {
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

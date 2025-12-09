// Port (Interface) for Payment Service
class PaymentService {
  async createPayment(orderData) {
    throw new Error('Method not implemented');
  }

  async verifyPayment(paymentId) {
    throw new Error('Method not implemented');
  }

  async refundPayment(paymentId) {
    throw new Error('Method not implemented');
  }

  async getPaymentStatus(paymentId) {
    throw new Error('Method not implemented');
  }
}

module.exports = PaymentService;

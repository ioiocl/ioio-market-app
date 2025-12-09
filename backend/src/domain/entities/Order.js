class Order {
  constructor({
    id,
    userId,
    orderNumber,
    status,
    subtotal,
    tax,
    shipping,
    total,
    paymentMethod,
    paymentStatus,
    paymentDetails,
    shippingAddress,
    notes,
    items,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.userId = userId;
    this.orderNumber = orderNumber;
    this.status = status || 'pending';
    this.subtotal = parseFloat(subtotal);
    this.tax = parseFloat(tax || 0);
    this.shipping = parseFloat(shipping || 0);
    this.total = parseFloat(total);
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus || 'pending';
    this.paymentDetails = paymentDetails || {};
    this.shippingAddress = shippingAddress || {};
    this.notes = notes;
    this.items = items || [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isPaid() {
    return this.paymentStatus === 'completed';
  }

  canBeCancelled() {
    return ['pending', 'processing'].includes(this.status);
  }

  markAsPaid() {
    this.paymentStatus = 'completed';
    this.status = 'processing';
  }

  cancel() {
    if (!this.canBeCancelled()) {
      throw new Error('Order cannot be cancelled');
    }
    this.status = 'cancelled';
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      orderNumber: this.orderNumber,
      status: this.status,
      subtotal: this.subtotal,
      tax: this.tax,
      shipping: this.shipping,
      total: this.total,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      paymentDetails: this.paymentDetails,
      shippingAddress: this.shippingAddress,
      notes: this.notes,
      items: this.items,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Order;

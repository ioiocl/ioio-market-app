const { v4: uuidv4 } = require('uuid');

class CreateOrderUseCase {
  constructor(orderRepository, productRepository, cartRepository) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.cartRepository = cartRepository;
  }

  async execute(userId, orderData) {
    // Get cart items
    const cartItems = await this.cartRepository.findByUserId(userId);
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const product = await this.productRepository.findById(cartItem.productId);
      
      if (!product) {
        throw new Error(`Product ${cartItem.productId} not found`);
      }

      if (!product.hasStock(cartItem.quantity)) {
        throw new Error(`Insufficient stock for ${product.nameEn}`);
      }

      const itemSubtotal = product.price * cartItem.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        productName: product.nameEn,
        quantity: cartItem.quantity,
        price: product.price,
        subtotal: itemSubtotal
      });
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = `IOIO-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Create order
    const order = await this.orderRepository.create({
      userId,
      orderNumber,
      status: 'pending',
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'pending',
      shippingAddress: orderData.shippingAddress,
      notes: orderData.notes,
      items: orderItems
    });

    // Update product stock
    for (const item of orderItems) {
      await this.productRepository.updateStock(item.productId, -item.quantity);
    }

    // Clear cart
    await this.cartRepository.clearByUserId(userId);

    return order;
  }
}

module.exports = CreateOrderUseCase;

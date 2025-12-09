class CartController {
  constructor(cartRepository) {
    this.cartRepository = cartRepository;
  }

  async getCart(req, res) {
    try {
      const userId = req.user?.userId;
      const sessionId = req.headers['x-session-id'];
      const language = req.headers['accept-language']?.startsWith('es') ? 'es' : 'en';

      let cartItems;
      if (userId) {
        cartItems = await this.cartRepository.findByUserId(userId);
      } else if (sessionId) {
        cartItems = await this.cartRepository.findBySessionId(sessionId);
      } else {
        return res.json({ cart: { items: [], total: 0 } });
      }

      const total = cartItems.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      const items = cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        name: language === 'es' ? item.product.nameEs : item.product.nameEn,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
        subtotal: item.product.price * item.quantity
      }));

      res.json({ cart: { items, total } });
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async addItem(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user?.userId || null;
      const sessionId = req.headers['x-session-id'] || null;

      if (!productId || !quantity) {
        return res.status(400).json({ 
          error: { message: 'Product ID and quantity are required' } 
        });
      }

      const cartItem = await this.cartRepository.addItem(
        userId,
        sessionId,
        productId,
        quantity
      );

      res.status(201).json({ cartItem });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async updateQuantity(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ 
          error: { message: 'Valid quantity is required' } 
        });
      }

      const cartItem = await this.cartRepository.updateQuantity(id, quantity);
      res.json({ cartItem });
    } catch (error) {
      res.status(400).json({ error: { message: error.message } });
    }
  }

  async removeItem(req, res) {
    try {
      const { id } = req.params;
      await this.cartRepository.removeItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }

  async clearCart(req, res) {
    try {
      const userId = req.user?.userId;
      const sessionId = req.headers['x-session-id'];

      if (userId) {
        await this.cartRepository.clearByUserId(userId);
      } else if (sessionId) {
        await this.cartRepository.clearBySessionId(sessionId);
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
    }
  }
}

module.exports = CartController;

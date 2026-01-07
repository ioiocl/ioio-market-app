class BitcoinService {
  constructor() {
    this.btcWalletAddress = process.env.BTC_WALLET_ADDRESS;
    this.ethWalletAddress = process.env.ETH_WALLET_ADDRESS;
  }

  /**
   * Generate payment instructions for Bitcoin
   */
  async createPaymentInstructions(order, paymentMethod) {
    const walletAddress = paymentMethod === 'btc' 
      ? this.btcWalletAddress 
      : this.ethWalletAddress;

    if (!walletAddress) {
      throw new Error(`${paymentMethod.toUpperCase()} wallet address not configured`);
    }

    // Convert USD to crypto (simplified - in production use real-time rates)
    const cryptoAmount = this.convertToCrypto(order.total, paymentMethod);

    return {
      walletAddress,
      amount: cryptoAmount,
      currency: paymentMethod.toUpperCase(),
      orderId: order.id,
      orderNumber: order.orderNumber,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      instructions: this.getPaymentInstructions(paymentMethod, walletAddress, cryptoAmount)
    };
  }

  /**
   * Convert USD amount to cryptocurrency
   * In production, use a real API like CoinGecko or CryptoCompare
   */
  convertToCrypto(usdAmount, paymentMethod) {
    // Simplified conversion rates (UPDATE THESE WITH REAL API)
    const rates = {
      btc: 0.000024, // Example: 1 USD = 0.000024 BTC (when BTC = ~$42,000)
      eth: 0.00044   // Example: 1 USD = 0.00044 ETH (when ETH = ~$2,300)
    };

    const rate = rates[paymentMethod] || 0;
    return (usdAmount * rate).toFixed(8);
  }

  /**
   * Get payment instructions text
   */
  getPaymentInstructions(paymentMethod, walletAddress, amount) {
    const currency = paymentMethod.toUpperCase();
    
    return {
      en: {
        title: `Pay with ${currency}`,
        steps: [
          `Send exactly ${amount} ${currency} to the address below`,
          `Wallet Address: ${walletAddress}`,
          `Payment must be received within 24 hours`,
          `After payment, your order will be processed within 1-2 hours`,
          `Save your transaction ID for reference`
        ],
        warning: `⚠️ Send only ${currency} to this address. Sending other cryptocurrencies may result in permanent loss.`
      },
      es: {
        title: `Pagar con ${currency}`,
        steps: [
          `Envía exactamente ${amount} ${currency} a la dirección de abajo`,
          `Dirección de Wallet: ${walletAddress}`,
          `El pago debe recibirse dentro de 24 horas`,
          `Después del pago, tu orden será procesada en 1-2 horas`,
          `Guarda tu ID de transacción para referencia`
        ],
        warning: `⚠️ Envía solo ${currency} a esta dirección. Enviar otras criptomonedas puede resultar en pérdida permanente.`
      }
    };
  }

  /**
   * Verify payment (placeholder - requires blockchain API integration)
   */
  async verifyPayment(orderId, transactionId) {
    // In production, integrate with blockchain explorers:
    // - Bitcoin: blockchain.com API, blockcypher.com
    // - Ethereum: etherscan.io API, infura.io
    
    console.log(`Verifying payment for order ${orderId}, transaction ${transactionId}`);
    
    // For now, return pending status
    // Admin will manually verify and update order status
    return {
      verified: false,
      status: 'pending',
      message: 'Payment verification pending. Admin will confirm manually.'
    };
  }

  /**
   * Check if wallet addresses are configured
   */
  isConfigured(paymentMethod) {
    if (paymentMethod === 'btc') {
      return !!this.btcWalletAddress;
    }
    if (paymentMethod === 'eth') {
      return !!this.ethWalletAddress;
    }
    return false;
  }
}

module.exports = BitcoinService;

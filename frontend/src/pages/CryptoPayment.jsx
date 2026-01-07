import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bitcoin, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { orderService } from '../api/services';

function CryptoPayment() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [paymentInstructions, setPaymentInstructions] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const instructions = searchParams.get('instructions');
    
    if (!orderId) {
      navigate('/');
      return;
    }

    // Parse payment instructions from URL
    if (instructions) {
      try {
        const parsedInstructions = JSON.parse(decodeURIComponent(instructions));
        setPaymentInstructions(parsedInstructions);
      } catch (error) {
        console.error('Error parsing instructions:', error);
      }
    }

    loadOrder(orderId);
  }, [searchParams]);

  const loadOrder = async (orderId) => {
    try {
      const res = await orderService.getById(orderId);
      setOrder(res.data.order);
      setLoading(false);
    } catch (error) {
      console.error('Error loading order:', error);
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type = 'address') => {
    navigator.clipboard.writeText(text);
    if (type === 'address') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-2xl neon-text">{t('common.loading')}</div>
      </div>
    );
  }

  if (!order || !paymentInstructions) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-cyber-pink mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Payment Information Not Found</h1>
        <button
          onClick={() => navigate('/')}
          className="cyber-button"
        >
          {t('common.backToHome')}
        </button>
      </div>
    );
  }

  const lang = i18n.language === 'es' ? 'es' : 'en';
  const instructions = paymentInstructions.instructions[lang];
  const currency = paymentInstructions.currency;
  const isBitcoin = currency === 'BTC';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-cyber-blue bg-opacity-20 rounded-full mb-4">
          <Bitcoin className={`w-12 h-12 ${isBitcoin ? 'text-cyber-yellow' : 'text-cyber-pink'}`} />
        </div>
        <h1 className="text-4xl font-bold mb-2 neon-text">{instructions.title}</h1>
        <p className="text-gray-400">
          {t('order.orderNumber')}: <span className="text-cyber-blue font-bold">{order.orderNumber}</span>
        </p>
      </div>

      {/* Payment Instructions Card */}
      <div className="cyber-card rounded-lg p-8 mb-6">
        {/* Amount Section */}
        <div className="mb-8 p-6 bg-cyber-black bg-opacity-50 rounded-lg border-2 border-cyber-blue">
          <div className="text-center">
            <p className="text-gray-400 mb-2">{t('checkout.amountToPay')}</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-4xl font-bold text-cyber-blue">
                {paymentInstructions.amount} {currency}
              </p>
              <button
                onClick={() => copyToClipboard(paymentInstructions.amount, 'amount')}
                className="p-2 hover:bg-cyber-gray rounded transition-colors"
                title={t('common.copy')}
              >
                {copiedAmount ? (
                  <CheckCircle className="w-5 h-5 text-cyber-green" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ≈ ${order.total} USD
            </p>
          </div>
        </div>

        {/* Wallet Address Section */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-3 text-cyber-blue">
            {t('checkout.walletAddress')}
          </label>
          <div className="flex items-center gap-2 p-4 bg-cyber-black bg-opacity-50 rounded-lg border border-cyber-gray">
            <code className="flex-1 text-sm break-all font-mono text-gray-300">
              {paymentInstructions.walletAddress}
            </code>
            <button
              onClick={() => copyToClipboard(paymentInstructions.walletAddress)}
              className="flex-shrink-0 p-2 hover:bg-cyber-gray rounded transition-colors"
              title={t('common.copy')}
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-cyber-green" />
              ) : (
                <Copy className="w-5 h-5 text-cyber-blue" />
              )}
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div className="mb-8 text-center">
          <div className="inline-block p-6 bg-white rounded-lg shadow-lg">
            <QRCodeSVG
              value={
                isBitcoin
                  ? `bitcoin:${paymentInstructions.walletAddress}?amount=${paymentInstructions.amount}`
                  : `ethereum:${paymentInstructions.walletAddress}?value=${paymentInstructions.amount}`
              }
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="text-sm text-gray-400 mt-3">
            {t('checkout.scanQRCode')}
          </p>
        </div>

        {/* Instructions Steps */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-cyber-blue">
            {t('checkout.paymentSteps')}
          </h3>
          <ol className="space-y-3">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyber-blue text-cyber-black rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-gray-300">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Warning */}
        <div className="p-4 bg-cyber-pink bg-opacity-10 border-2 border-cyber-pink rounded-lg mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-cyber-pink flex-shrink-0" />
            <p className="text-sm text-gray-300">{instructions.warning}</p>
          </div>
        </div>

        {/* Expiration Timer */}
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Clock className="w-5 h-5" />
          <span className="text-sm">
            {t('checkout.paymentExpires')}: {new Date(paymentInstructions.expiresAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="cyber-card rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-cyber-blue">{t('checkout.orderSummary')}</h3>
        <div className="space-y-2">
          {order.items?.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-400">
                {item.productName} x {item.quantity}
              </span>
              <span className="text-gray-300">${item.subtotal}</span>
            </div>
          ))}
          <div className="border-t border-cyber-gray pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>{t('cart.total')}</span>
              <span className="text-cyber-blue">${order.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="cyber-button flex-1"
        >
          {t('order.viewMyOrders')}
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 px-6 py-3 border-2 border-cyber-blue text-cyber-blue rounded-lg hover:bg-cyber-blue hover:text-cyber-black transition-colors font-bold"
        >
          {t('common.backToHome')}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>{t('checkout.needHelp')}</p>
        <p className="mt-2">
          {t('checkout.contactSupport')}: <a href="mailto:support@ioio.com" className="text-cyber-blue hover:underline">support@ioio.com</a>
        </p>
      </div>
    </div>
  );
}

export default CryptoPayment;

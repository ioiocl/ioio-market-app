# Configuración de Pagos con Bitcoin y Ethereum

## 📋 Resumen

El sistema de pagos con criptomonedas está completamente implementado y listo para usar. Solo necesitas configurar tus direcciones de wallet para empezar a recibir pagos.

## ✅ Estado de Implementación

- ✅ **Frontend**: Opciones de pago Bitcoin y Ethereum en checkout
- ✅ **Backend**: Servicio de Bitcoin para generar instrucciones de pago
- ✅ **Página de Pago**: Interfaz completa con instrucciones para el usuario
- ✅ **Traducciones**: Textos en inglés y español

## 🔧 Configuración Rápida

### 1. Obtén tus Direcciones de Wallet

#### Para Bitcoin (BTC):
1. Descarga una wallet confiable:
   - **Coinbase**: https://www.coinbase.com (Fácil para principiantes)
   - **Binance**: https://www.binance.com
   - **Trust Wallet**: https://trustwallet.com (Móvil)
   - **Electrum**: https://electrum.org (Desktop, más técnico)

2. Crea una cuenta y verifica tu identidad
3. Busca la opción "Recibir Bitcoin" o "Receive BTC"
4. Copia tu dirección de wallet (ejemplo: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`)

#### Para Ethereum (ETH):
1. Usa las mismas wallets mencionadas arriba (todas soportan ETH)
2. O usa **MetaMask**: https://metamask.io (muy popular para ETH)
3. Busca "Recibir Ethereum" o "Receive ETH"
4. Copia tu dirección de wallet (ejemplo: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`)

### 2. Configura las Variables de Entorno

Edita el archivo `.env` en la carpeta `backend/`:

```env
# Cryptocurrency Payment Configuration
BTC_WALLET_ADDRESS=TU_DIRECCION_BITCOIN_AQUI
ETH_WALLET_ADDRESS=TU_DIRECCION_ETHEREUM_AQUI
```

**Ejemplo real:**
```env
BTC_WALLET_ADDRESS=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
ETH_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### 3. Reinicia el Backend

```bash
# Si usas Docker
docker-compose restart backend

# Si corres el backend manualmente
cd backend
npm start
```

## 🎯 ¿Dónde Poner tu Dirección de Wallet?

### Ubicación del Archivo
```
ioio-app/
└── backend/
    └── .env  ← AQUÍ configuras tus direcciones
```

### Formato del Archivo .env
```env
# ... otras configuraciones ...

# AQUÍ PONES TUS DIRECCIONES DE WALLET
BTC_WALLET_ADDRESS=tu_direccion_bitcoin
ETH_WALLET_ADDRESS=tu_direccion_ethereum
```

## 💡 Cómo Funciona

### Flujo de Pago

1. **Cliente selecciona Bitcoin/Ethereum** en el checkout
2. **Sistema genera instrucciones de pago** con:
   - Tu dirección de wallet
   - Monto exacto a pagar (convertido a BTC/ETH)
   - Tiempo de expiración (24 horas)
   - Instrucciones paso a paso

3. **Cliente ve página de pago** (`/crypto-payment`) con:
   - Dirección de wallet para copiar
   - Monto exacto en criptomoneda
   - QR code (placeholder para implementar)
   - Advertencias de seguridad

4. **Cliente envía el pago** desde su wallet
5. **Tú recibes el pago** en tu wallet
6. **Verificas manualmente** el pago en el panel de admin
7. **Actualizas el estado** de la orden a "pagado"

### Conversión de Moneda

El sistema usa tasas de conversión simplificadas en:
```
backend/src/infrastructure/services/BitcoinService.js
```

**⚠️ IMPORTANTE**: Las tasas están hardcodeadas para desarrollo. Para producción, debes:
- Integrar una API de precios en tiempo real (CoinGecko, CryptoCompare, etc.)
- Actualizar el método `convertToCrypto()` en `BitcoinService.js`

### Tasas Actuales (Ejemplo)
```javascript
const rates = {
  btc: 0.000024, // 1 USD = 0.000024 BTC (BTC ≈ $42,000)
  eth: 0.00044   // 1 USD = 0.00044 ETH (ETH ≈ $2,300)
};
```

## 🔐 Seguridad

### ✅ Buenas Prácticas

1. **Nunca compartas tu clave privada** (private key)
2. **Solo comparte la dirección pública** (public address)
3. **Verifica que la dirección sea correcta** antes de configurar
4. **Usa wallets de exchanges confiables** para empezar
5. **Activa 2FA** (autenticación de dos factores) en tu wallet

### ⚠️ Advertencias

- Las direcciones de wallet son **case-sensitive** (mayúsculas/minúsculas importan)
- Una dirección incorrecta puede resultar en **pérdida permanente de fondos**
- Los pagos en blockchain son **irreversibles**

## 📊 Verificación de Pagos

### Verificación Manual (Actual)

1. Cliente realiza el pago
2. Tú recibes notificación en tu wallet
3. Verificas el pago en tu wallet o blockchain explorer:
   - **Bitcoin**: https://blockchain.com/explorer
   - **Ethereum**: https://etherscan.io

4. En el panel de admin (`/admin/orders`):
   - Busca la orden
   - Verifica que el monto coincida
   - Actualiza el estado a "Paid" (Pagado)

### Verificación Automática (Futuro)

Para automatizar la verificación, puedes integrar:

**Para Bitcoin:**
- Blockchain.com API: https://www.blockchain.com/api
- BlockCypher API: https://www.blockcypher.com/dev/bitcoin/
- Coinbase Commerce: https://commerce.coinbase.com

**Para Ethereum:**
- Etherscan API: https://etherscan.io/apis
- Infura: https://infura.io
- Alchemy: https://www.alchemy.com

## 🧪 Pruebas

### Testnet (Recomendado para Pruebas)

Antes de usar dinero real, prueba con testnets:

**Bitcoin Testnet:**
- Faucet (obtén BTC gratis para pruebas): https://testnet-faucet.mempool.co
- Explorer: https://blockstream.info/testnet/

**Ethereum Testnet (Sepolia):**
- Faucet: https://sepoliafaucet.com
- Explorer: https://sepolia.etherscan.io

Para usar testnet, modifica `BitcoinService.js` para aceptar direcciones de testnet.

## 📱 Interfaz de Usuario

### Página de Pago Crypto

Cuando un cliente selecciona Bitcoin/Ethereum, verá:

```
/crypto-payment?orderId=xxx&instructions=xxx
```

**Características:**
- ✅ Dirección de wallet con botón de copiar
- ✅ Monto exacto en BTC/ETH
- ✅ Equivalente en USD
- ✅ Instrucciones paso a paso
- ✅ Advertencias de seguridad
- ✅ Temporizador de expiración (24h)
- ✅ Resumen de la orden
- ⏳ QR Code (placeholder - para implementar)

## 🚀 Mejoras Futuras

### Implementaciones Recomendadas

1. **QR Codes**
   - Instalar: `npm install qrcode.react`
   - Generar QR con la dirección y monto
   - Facilita el pago desde móvil

2. **Precios en Tiempo Real**
   ```javascript
   // Ejemplo con CoinGecko API (gratis)
   const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
   const prices = await response.json();
   ```

3. **Verificación Automática**
   - Webhook de Coinbase Commerce
   - Polling de blockchain explorers
   - Actualización automática del estado de orden

4. **Notificaciones**
   - Email al cliente cuando se confirma el pago
   - Notificación al admin cuando llega un pago

## 🆘 Solución de Problemas

### Error: "BTC wallet address not configured"

**Causa**: No has configurado `BTC_WALLET_ADDRESS` en `.env`

**Solución**:
1. Edita `backend/.env`
2. Agrega: `BTC_WALLET_ADDRESS=tu_direccion`
3. Reinicia el backend

### El cliente no ve la página de pago

**Causa**: Ruta no registrada o error en el frontend

**Solución**:
1. Verifica que `CryptoPayment.jsx` existe
2. Verifica que la ruta está en `App.jsx`
3. Revisa la consola del navegador para errores

### La conversión de precio está incorrecta

**Causa**: Tasas hardcodeadas desactualizadas

**Solución**:
1. Actualiza las tasas en `BitcoinService.js`
2. O implementa API de precios en tiempo real

## 📞 Soporte

### Recursos Útiles

- **Documentación Bitcoin**: https://bitcoin.org/en/developer-documentation
- **Documentación Ethereum**: https://ethereum.org/en/developers/docs/
- **CoinGecko API**: https://www.coingecko.com/en/api/documentation
- **Blockchain Explorers**:
  - Bitcoin: https://blockchain.com
  - Ethereum: https://etherscan.io

### Contacto

Si tienes problemas con la implementación:
1. Revisa los logs del backend: `docker-compose logs backend`
2. Revisa la consola del navegador (F12)
3. Verifica que las variables de entorno estén configuradas

---

## ✨ Resumen Rápido

### Para Habilitar Bitcoin/Ethereum:

1. **Crea una wallet** en Coinbase, Binance o Trust Wallet
2. **Copia tu dirección** de recepción
3. **Edita `backend/.env`**:
   ```env
   BTC_WALLET_ADDRESS=tu_direccion_bitcoin
   ETH_WALLET_ADDRESS=tu_direccion_ethereum
   ```
4. **Reinicia el backend**: `docker-compose restart backend`
5. **¡Listo!** Los clientes ya pueden pagar con crypto

### Ubicación de la Dirección

```
📁 ioio-app/
  📁 backend/
    📄 .env  ← AQUÍ pones: BTC_WALLET_ADDRESS=...
```

**¡Eso es todo! El sistema está listo para recibir pagos en Bitcoin y Ethereum.**

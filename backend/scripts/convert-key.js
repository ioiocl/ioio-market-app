// backend/convert-key.js
const bs58 = require('bs58');

// PEGA TU CLAVE PRIVADA DE PHANTOM AQUÍ (entre las comillas)
const privateKeyBase58 = '3Ep5b2B5duNEjMX5G6mzkV73Xtxp4ouvQxhcnxP2UF7LUYHqw7s9tjGt5TrvWXU86tsr9URhP7cqT4tYyPYbiyWC';

// Convertir a array
const decoded = bs58.default ? bs58.default.decode(privateKeyBase58) : bs58.decode(privateKeyBase58);
const privateKeyArray = Array.from(decoded);

console.log('\n✅ Copia esta línea completa a tu .env:\n');
console.log(`SOLANA_PRIVATE_KEY=${JSON.stringify(privateKeyArray)}`);
console.log('\n');
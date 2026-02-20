// convertir-phantom-a-solana.js
const { Keypair } = require("@solana/web3.js");
const bs58 = require('bs58').default || require('bs58');
const fs = require('fs');

// --- REEMPLAZA ESTA LÍNEA CON TU CLAVE PRIVADA DE PHANTOM ---
// (La que copiaste en el paso 1, entre las comillas)
const privateKeyBase58 = "6qAAAD7UcA37nDyyJWbzZ34CkjoRc2U7f1GftcCsnudnBpH9GVN1KJccFLYncSqJE4cFyKW4yfGp5Lx97tztFzd";
// ---

try {
    // 1. Decodificar la clave de base58 a un arreglo de bytes (Uint8Array)
    console.log("Decodificando clave base58...");
    const secretKeyBytes = bs58.decode(privateKeyBase58);

    // 2. Crear un Keypair oficial de Solana a partir de los bytes
    //    (Esto valida que la clave sea correcta)
    const keypair = Keypair.fromSecretKey(secretKeyBytes);
    console.log("Clave válida. Dirección pública:", keypair.publicKey.toString());

    // 3. Obtener el arreglo de la clave secreta (que incluye también la pública)
    //    Este es el formato que necesita el CLI: un array de números.
    const secretKeyArray = Array.from(keypair.secretKey);

    // 4. Guardar ese array en un archivo keypair.json
    fs.writeFileSync('mi-wallet.json', JSON.stringify(secretKeyArray));
    console.log("✅ Archivo 'mi-wallet.json' creado con éxito!");

} catch (error) {
    console.error("❌ Error:", error.message);
}
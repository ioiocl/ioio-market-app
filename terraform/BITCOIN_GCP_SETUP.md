# Configuración de Bitcoin para Despliegue en GCP

## 📍 Dónde Configurar tu Dirección de Bitcoin en Terraform

### Archivo Principal de Configuración

```
ioio-app/
└── terraform/
    └── terraform.tfvars  ← AQUÍ configuras tu dirección Bitcoin para GCP
```

## 🚀 Pasos para Configurar

### 1. Edita el Archivo terraform.tfvars

Abre el archivo `terraform/terraform.tfvars` y agrega tus direcciones de wallet:

```hcl
# Cryptocurrency Wallet Addresses
btc_wallet_address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"  # Tu dirección Bitcoin
eth_wallet_address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"  # Tu dirección Ethereum
```

### 2. Ejemplo Completo de terraform.tfvars

```hcl
# GCP Project Configuration
project_id  = "ioio-finbot"
region      = "us-central1"
zone        = "us-central1-a"

# Database Configuration
db_name     = "ioio_db"
db_user     = "ioio_user"
db_password = "Hf8dJqZ7WPXmJ6ZHk"

# JWT Secret
jwt_secret  = "qxbXhhPMcExs4ht"

# Google Cloud Storage
gcs_bucket_name = "ioio-products"

# ⭐ AQUÍ PONES TUS DIRECCIONES DE WALLET ⭐
btc_wallet_address = "TU_DIRECCION_BITCOIN_AQUI"
eth_wallet_address = "TU_DIRECCION_ETHEREUM_AQUI"
```

### 3. Despliega a GCP

```bash
cd terraform
terraform plan
terraform apply
```

## 🔄 Cómo Funciona

### Flujo de Configuración

1. **Defines las variables** en `terraform.tfvars`
2. **Terraform lee las variables** de `variables.tf`
3. **Terraform pasa las variables** al script `startup-backend.sh`
4. **El script crea el archivo .env** en el servidor con tus direcciones
5. **El backend lee las direcciones** del archivo .env
6. **Los clientes pueden pagar** con Bitcoin/Ethereum

### Archivos Modificados

#### 1. `terraform/variables.tf`
Define las variables de Bitcoin:
```hcl
variable "btc_wallet_address" {
  description = "Bitcoin wallet address for receiving payments"
  type        = string
  default     = ""
}

variable "eth_wallet_address" {
  description = "Ethereum wallet address for receiving payments"
  type        = string
  default     = ""
}
```

#### 2. `terraform/main.tf`
Pasa las variables al script de inicio:
```hcl
metadata_startup_script = templatefile("${path.module}/startup-backend.sh", {
  # ... otras variables ...
  btc_wallet_address = var.btc_wallet_address
  eth_wallet_address = var.eth_wallet_address
})
```

#### 3. `terraform/startup-backend.sh`
Crea el archivo .env en el servidor:
```bash
cat > backend/.env <<EOF
# ... otras variables ...
BTC_WALLET_ADDRESS=${btc_wallet_address}
ETH_WALLET_ADDRESS=${eth_wallet_address}
FRONTEND_URL=https://ioio.cl
BACKEND_URL=https://api.ioio.cl
EOF
```

## 📋 Checklist de Despliegue

Antes de hacer `terraform apply`, verifica:

- [ ] Tienes una dirección de Bitcoin válida
- [ ] Tienes una dirección de Ethereum válida (opcional)
- [ ] Has editado `terraform/terraform.tfvars`
- [ ] Las direcciones están entre comillas: `"tu_direccion"`
- [ ] Has verificado que las direcciones son correctas
- [ ] Tienes acceso a las wallets para recibir pagos

## 🔐 Seguridad

### ⚠️ Importante

- **NO compartas tu archivo `terraform.tfvars`** (contiene contraseñas)
- **Agrega `terraform.tfvars` al `.gitignore`**
- **Solo comparte la dirección pública** de tu wallet (nunca la clave privada)
- **Verifica que la dirección sea correcta** antes de desplegar

### Verificación de Dirección

Antes de desplegar, verifica tu dirección:

**Bitcoin:**
- Debe empezar con `1`, `3` o `bc1`
- Ejemplo: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
- Longitud: 26-35 caracteres

**Ethereum:**
- Debe empezar con `0x`
- Ejemplo: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- Longitud: 42 caracteres (incluyendo `0x`)

## 🧪 Pruebas

### Verificar la Configuración

Después del despliegue, verifica que las variables se configuraron correctamente:

```bash
# SSH al servidor backend
gcloud compute ssh ioio-backend --zone=us-central1-a

# Ver el archivo .env
cat /opt/ioio/backend/.env | grep WALLET

# Deberías ver:
# BTC_WALLET_ADDRESS=tu_direccion_bitcoin
# ETH_WALLET_ADDRESS=tu_direccion_ethereum
```

### Probar el Pago

1. Ve a tu sitio: https://ioio.cl
2. Agrega un producto al carrito
3. Ve al checkout
4. Selecciona "Bitcoin (BTC)" como método de pago
5. Verifica que aparezca tu dirección de wallet
6. Verifica que el monto en BTC sea correcto

## 🔄 Actualizar Direcciones

Si necesitas cambiar las direcciones después del despliegue:

### Opción 1: Re-desplegar con Terraform

```bash
# 1. Edita terraform.tfvars con las nuevas direcciones
# 2. Aplica los cambios
cd terraform
terraform apply

# Terraform recreará la instancia con las nuevas variables
```

### Opción 2: Actualización Manual (Más Rápido)

```bash
# 1. SSH al servidor
gcloud compute ssh ioio-backend --zone=us-central1-a

# 2. Edita el archivo .env
sudo nano /opt/ioio/backend/.env

# 3. Actualiza las líneas:
# BTC_WALLET_ADDRESS=nueva_direccion
# ETH_WALLET_ADDRESS=nueva_direccion

# 4. Reinicia el contenedor
sudo docker restart ioio-backend
```

## 📊 Monitoreo de Pagos

### Verificar Pagos Recibidos

Puedes verificar los pagos en:

**Bitcoin:**
- Blockchain Explorer: https://blockchain.com/explorer
- Busca tu dirección para ver transacciones

**Ethereum:**
- Etherscan: https://etherscan.io
- Busca tu dirección para ver transacciones

### Panel de Admin

1. Ve a https://ioio.cl/admin/orders
2. Busca órdenes con método de pago "BTC" o "ETH"
3. Verifica el pago en el blockchain explorer
4. Actualiza el estado de la orden a "Paid"

## 🚨 Solución de Problemas

### Error: "BTC wallet address not configured"

**Causa:** La variable no se configuró correctamente en Terraform

**Solución:**
1. Verifica que `terraform.tfvars` tenga la dirección
2. Verifica que no esté vacía: `btc_wallet_address = ""`
3. Re-aplica Terraform: `terraform apply`

### La dirección no aparece en el sitio

**Causa:** El backend no leyó la variable de entorno

**Solución:**
```bash
# SSH al servidor
gcloud compute ssh ioio-backend

# Verifica el .env
cat /opt/ioio/backend/.env | grep BTC

# Verifica los logs del contenedor
sudo docker logs ioio-backend | grep BTC

# Reinicia el contenedor
sudo docker restart ioio-backend
```

### Dirección incorrecta después de desplegar

**Causa:** Error al escribir la dirección en terraform.tfvars

**Solución:**
1. Edita `terraform.tfvars` con la dirección correcta
2. Aplica los cambios: `terraform apply`
3. O actualiza manualmente (ver "Actualizar Direcciones")

## 📚 Recursos Adicionales

- **Guía de Bitcoin**: Ver `BITCOIN_SETUP.md` en la raíz del proyecto
- **Terraform Docs**: https://www.terraform.io/docs
- **GCP Compute Engine**: https://cloud.google.com/compute/docs

## ✨ Resumen Rápido

### Para configurar Bitcoin en GCP:

1. **Edita** `terraform/terraform.tfvars`
2. **Agrega** tu dirección:
   ```hcl
   btc_wallet_address = "tu_direccion_bitcoin"
   eth_wallet_address = "tu_direccion_ethereum"
   ```
3. **Despliega**:
   ```bash
   cd terraform
   terraform apply
   ```
4. **Verifica** que funcione en https://ioio.cl

**¡Eso es todo! Tu sitio en GCP ahora puede recibir pagos en Bitcoin y Ethereum.**

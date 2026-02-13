#!/bin/bash
# Script para desplegar la funcionalidad de Actividades en Google Cloud
# Uso: ./deploy-activities.sh

set -e

echo "🚀 Iniciando despliegue de Actividades..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "ACTIVITIES_DEPLOYMENT_GUIDE.md" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde el directorio raíz del proyecto${NC}"
    exit 1
fi

# Función para mostrar progreso
progress() {
    echo -e "${BLUE}▶ $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Paso 1: Verificar configuración de gcloud
progress "Verificando configuración de Google Cloud..."
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    error "No hay proyecto configurado en gcloud"
    echo "Ejecuta: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi
success "Proyecto: $PROJECT_ID"

# Paso 2: Obtener información de la base de datos
progress "Obteniendo información de Cloud SQL..."
DB_IP=$(gcloud sql instances describe ioio-postgres --format="value(ipAddresses[0].ipAddress)" 2>/dev/null)
if [ -z "$DB_IP" ]; then
    error "No se pudo obtener la IP de Cloud SQL"
    exit 1
fi
success "Cloud SQL IP: $DB_IP"

# Paso 3: Aplicar migración de base de datos
progress "Aplicando migración de base de datos..."
echo "Necesitarás ingresar la contraseña de la base de datos"
read -sp "Contraseña de PostgreSQL: " DB_PASSWORD
echo

# Aplicar migración
PGPASSWORD=$DB_PASSWORD psql \
    -h $DB_IP \
    -U postgres \
    -d ioio_db \
    -f database/migration_add_activities.sql 2>/dev/null

if [ $? -eq 0 ]; then
    success "Migración de base de datos aplicada correctamente"
else
    error "Error al aplicar la migración. Intenta manualmente con:"
    echo "gcloud sql connect ioio-postgres --user=postgres"
    exit 1
fi

# Paso 4: Actualizar código en el backend
progress "Actualizando código en el servidor backend..."
gcloud compute ssh ioio-backend --zone=us-central1-a --command="
    set -e
    cd /opt/ioio
    sudo git pull origin main
    cd backend
    sudo docker stop ioio-backend || true
    sudo docker rm ioio-backend || true
    sudo docker build -t ioio-backend .
    sudo docker run -d \
        --name ioio-backend \
        --restart unless-stopped \
        -p 5000:5000 \
        --env-file .env \
        ioio-backend npm start
    echo 'Backend actualizado'
" 2>/dev/null

if [ $? -eq 0 ]; then
    success "Backend actualizado correctamente"
else
    error "Error al actualizar el backend"
    exit 1
fi

# Esperar a que el backend inicie
progress "Esperando a que el backend inicie..."
sleep 10

# Paso 5: Actualizar código en el frontend
progress "Actualizando código en el servidor frontend..."
gcloud compute ssh ioio-frontend --zone=us-central1-a --command="
    set -e
    cd /opt/ioio
    sudo git pull origin main
    cd frontend
    sudo docker stop ioio-frontend || true
    sudo docker rm ioio-frontend || true
    sudo docker build -t ioio-frontend .
    sudo docker run -d \
        --name ioio-frontend \
        --restart unless-stopped \
        -p 3000:3000 \
        ioio-frontend
    echo 'Frontend actualizado'
" 2>/dev/null

if [ $? -eq 0 ]; then
    success "Frontend actualizado correctamente"
else
    error "Error al actualizar el frontend"
    exit 1
fi

# Paso 6: Verificar despliegue
progress "Verificando despliegue..."
BACKEND_IP=$(gcloud compute instances describe ioio-backend --zone=us-central1-a --format="value(networkInterfaces[0].accessConfigs[0].natIP)")
FRONTEND_IP=$(gcloud compute instances describe ioio-frontend --zone=us-central1-a --format="value(networkInterfaces[0].accessConfigs[0].natIP)")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "¡Despliegue completado exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 URLs de acceso:"
echo "   Backend API:    http://$BACKEND_IP:5000/api/activities"
echo "   Frontend:       http://$FRONTEND_IP:3000/actividades"
echo "   Admin Panel:    http://$FRONTEND_IP:3000/admin/activities"
echo ""
echo "🧪 Prueba el endpoint:"
echo "   curl http://$BACKEND_IP:5000/api/activities"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Accede al panel admin: http://$FRONTEND_IP:3000/admin"
echo "   2. Ve a la sección 'Actividades'"
echo "   3. Crea tu primera actividad"
echo "   4. Verifica que aparezca en: http://$FRONTEND_IP:3000/actividades"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

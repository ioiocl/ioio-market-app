# Frontend Nginx Fix - Febrero 19, 2026

## Problema
Al acceder a `ioio.cl` o `http://34.71.232.74/`, aparece la página de bienvenida de nginx en lugar de la aplicación frontend.

```
"Welcome to nginx!"
If you see this page, the nginx web server is successfully installed and working.
```

## Causa Raíz
Nginx está instalado y corriendo en el servidor, pero no está configurado como reverse proxy para la aplicación frontend que corre en el contenedor Docker en el puerto 3000.

## Solución

### Opción 1: Configurar Nginx como Reverse Proxy (Recomendado para Producción)

#### Paso 1: Conectar al servidor vía SSH
```powershell
# Conectar al servidor frontend
gcloud compute ssh ioio-frontend --zone=us-central1-a
```

#### Paso 2: Subir y ejecutar el script de configuración
```powershell
# Desde tu máquina local, subir el script
gcloud compute scp terraform/setup-nginx-frontend.sh ioio-frontend:/tmp/setup-nginx-frontend.sh --zone=us-central1-a

# Ejecutar el script en el servidor
gcloud compute ssh ioio-frontend --zone=us-central1-a --command="sudo bash /tmp/setup-nginx-frontend.sh"
```

#### Paso 3: Verificar que el contenedor frontend esté corriendo
```bash
# En el servidor, verificar Docker
sudo docker ps | grep ioio-frontend

# Si no está corriendo, iniciarlo
cd /opt/ioio/frontend
sudo docker-compose up -d
```

### Opción 2: Acceso Directo al Puerto 3000 (Temporal)

Si solo necesitas acceso temporal, puedes acceder directamente al puerto 3000:
```
http://34.71.232.74:3000
```

**Nota**: Esto requiere que el firewall de GCP permita tráfico en el puerto 3000.

### Opción 3: Usar Docker Compose con Nginx Incluido

Agregar un servicio nginx al `docker-compose.yml` para manejar el proxy localmente.

## Arquitectura Correcta

```
Usuario
    ↓ HTTP/HTTPS
Cloudflare (SSL/TLS)
    ↓ HTTP
Servidor Frontend (34.71.232.74)
    ↓ Nginx (Puerto 80) - ioio.cl
    ↓ Reverse Proxy
Contenedor Frontend Docker (localhost:3000)
    ↓ Vite Dev Server / React App
Aplicación Frontend
```

## Verificación

Después de aplicar la solución, verificar:

```powershell
# Verificar que nginx está corriendo
gcloud compute ssh ioio-frontend --zone=us-central1-a --command="sudo systemctl status nginx"

# Verificar configuración de nginx
gcloud compute ssh ioio-frontend --zone=us-central1-a --command="sudo cat /etc/nginx/sites-enabled/frontend"

# Verificar que el contenedor está corriendo
gcloud compute ssh ioio-frontend --zone=us-central1-a --command="sudo docker ps"

# Probar el sitio
Invoke-WebRequest -Uri "http://34.71.232.74/" -UseBasicParsing
```

## Archivos Creados

1. ✅ `terraform/setup-nginx-frontend.sh` - Script de configuración de nginx para frontend
2. ✅ `FRONTEND_NGINX_FIX.md` - Esta documentación

## Comandos Rápidos

### Ver logs de nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Ver logs del contenedor frontend
```bash
sudo docker logs -f ioio-frontend
```

### Reiniciar nginx
```bash
sudo systemctl restart nginx
```

### Reiniciar contenedor frontend
```bash
sudo docker restart ioio-frontend
```

## Prevención

Para evitar este problema en el futuro:
1. Incluir la configuración de nginx en el startup script
2. Usar docker-compose con nginx incluido
3. Documentar la configuración requerida

## Estado
⏳ **PENDIENTE** - Requiere ejecución del script en el servidor

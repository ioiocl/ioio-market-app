# Guía de Despliegue: Sistema de Actividades

Esta guía explica cómo aplicar la nueva funcionalidad de **Actividades** a tu infraestructura desplegada en Google Cloud con Terraform.

## 📋 Cambios Realizados

### Backend
- ✅ Repositorio: `PostgresActivityRepository.js`
- ✅ Controller: Métodos CRUD en `ContentController.js`
- ✅ Rutas API: `/api/activities` endpoints
- ✅ Migración DB: `database/migration_add_activities.sql`

### Frontend
- ✅ Servicio API: `activityService` en `services.js`
- ✅ Panel Admin: `/admin/activities`
- ✅ Página Pública: `/actividades`
- ✅ Dashboard: Botón "Actividades" agregado

---

## 🚀 Opción 1: Aplicar Migración a Base de Datos Existente (RECOMENDADO)

Si ya tienes la infraestructura desplegada y funcionando, usa este método para agregar solo la tabla de actividades.

### Paso 1: Conectarse a Cloud SQL

```bash
# Obtener la IP de la instancia de Cloud SQL
gcloud sql instances describe ioio-postgres --format="value(ipAddresses[0].ipAddress)"

# Conectarse usando Cloud SQL Proxy (más seguro)
gcloud sql connect ioio-postgres --user=postgres --quiet
```

### Paso 2: Aplicar la Migración

Una vez conectado a PostgreSQL:

```sql
-- Verificar que estás en la base de datos correcta
\c ioio_db

-- Aplicar la migración
\i /path/to/database/migration_add_activities.sql

-- Verificar que la tabla fue creada
\dt activities
\d activities
```

### Paso 3: Actualizar el Código en el Servidor Backend

```bash
# SSH al servidor backend
gcloud compute ssh ioio-backend --zone=us-central1-a

# Navegar al directorio de la aplicación
cd /opt/ioio

# Hacer pull de los últimos cambios
sudo git pull origin main

# Reconstruir y reiniciar el contenedor
cd backend
sudo docker stop ioio-backend
sudo docker rm ioio-backend
sudo docker build -t ioio-backend .
sudo docker run -d \
  --name ioio-backend \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  ioio-backend npm start

# Verificar que está corriendo
sudo docker logs -f ioio-backend
```

### Paso 4: Actualizar el Frontend

```bash
# SSH al servidor frontend
gcloud compute ssh ioio-frontend --zone=us-central1-a

# Navegar al directorio de la aplicación
cd /opt/ioio

# Hacer pull de los últimos cambios
sudo git pull origin main

# Reconstruir y reiniciar el contenedor
cd frontend
sudo docker stop ioio-frontend
sudo docker rm ioio-frontend
sudo docker build -t ioio-frontend .
sudo docker run -d \
  --name ioio-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  ioio-frontend

# Verificar que está corriendo
sudo docker logs -f ioio-frontend
```

---

## 🔄 Opción 2: Aplicar Migración desde tu Máquina Local

Si prefieres ejecutar la migración desde tu máquina local:

### Paso 1: Instalar Cloud SQL Proxy

```bash
# Descargar Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64
chmod +x cloud-sql-proxy
```

### Paso 2: Iniciar el Proxy

```bash
# Obtener el connection name de tu instancia
gcloud sql instances describe ioio-postgres --format="value(connectionName)"

# Iniciar el proxy (reemplaza PROJECT:REGION:INSTANCE con tu connection name)
./cloud-sql-proxy PROJECT:REGION:INSTANCE
```

### Paso 3: Conectar y Aplicar Migración

En otra terminal:

```bash
# Conectar a la base de datos a través del proxy
psql "host=127.0.0.1 port=5432 dbname=ioio_db user=postgres"

# Aplicar la migración
\i database/migration_add_activities.sql
```

---

## 🆕 Opción 3: Redesplegar Completamente con Terraform

Si prefieres redesplegar toda la infraestructura (esto recreará las instancias):

### Paso 1: Actualizar el Repositorio

```bash
# Asegúrate de que todos los cambios estén en tu repositorio Git
git add .
git commit -m "Add activities feature"
git push origin main
```

### Paso 2: Aplicar Terraform

```bash
cd terraform

# Revisar los cambios
terraform plan

# Aplicar (esto puede recrear las instancias)
terraform apply

# Nota: Si solo quieres forzar la recreación de las instancias:
terraform taint google_compute_instance.backend
terraform taint google_compute_instance.frontend
terraform apply
```

---

## 📝 Opción 4: Script Automatizado de Migración

Crea un script para automatizar la migración:

```bash
#!/bin/bash
# migrate-activities.sh

echo "🔧 Aplicando migración de actividades..."

# Obtener la IP de Cloud SQL
DB_IP=$(gcloud sql instances describe ioio-postgres --format="value(ipAddresses[0].ipAddress)")

# Aplicar migración
PGPASSWORD=$DB_PASSWORD psql \
  -h $DB_IP \
  -U $DB_USER \
  -d $DB_NAME \
  -f database/migration_add_activities.sql

echo "✅ Migración completada"

# Reiniciar backend
echo "🔄 Reiniciando backend..."
gcloud compute ssh ioio-backend --zone=us-central1-a --command="
  cd /opt/ioio && \
  sudo git pull origin main && \
  cd backend && \
  sudo docker restart ioio-backend
"

# Reiniciar frontend
echo "🔄 Reiniciando frontend..."
gcloud compute ssh ioio-frontend --zone=us-central1-a --command="
  cd /opt/ioio && \
  sudo git pull origin main && \
  cd frontend && \
  sudo docker restart ioio-frontend
"

echo "✅ Despliegue completado"
```

Ejecutar:

```bash
chmod +x migrate-activities.sh
./migrate-activities.sh
```

---

## ✅ Verificación Post-Despliegue

### 1. Verificar la Base de Datos

```bash
gcloud sql connect ioio-postgres --user=postgres

# En psql:
\c ioio_db
SELECT * FROM activities;
\d activities
```

### 2. Verificar el Backend

```bash
# Probar el endpoint de actividades
curl http://BACKEND_IP:5000/api/activities

# Debería retornar: {"activities": []}
```

### 3. Verificar el Frontend

Accede a:
- Panel Admin: `http://FRONTEND_IP/admin/activities`
- Página Pública: `http://FRONTEND_IP/actividades`

### 4. Crear una Actividad de Prueba

1. Inicia sesión en `/admin`
2. Ve a "Actividades"
3. Crea una nueva actividad
4. Verifica que aparezca en `/actividades`

---

## 🔍 Troubleshooting

### Error: "relation 'activities' does not exist"

La migración no se aplicó correctamente. Ejecuta manualmente:

```bash
gcloud sql connect ioio-postgres --user=postgres
\c ioio_db
\i database/migration_add_activities.sql
```

### Error: Backend no responde

```bash
# Ver logs del backend
gcloud compute ssh ioio-backend --zone=us-central1-a
sudo docker logs ioio-backend

# Reiniciar contenedor
sudo docker restart ioio-backend
```

### Error: Frontend no muestra la página de actividades

```bash
# Limpiar cache y reconstruir
gcloud compute ssh ioio-frontend --zone=us-central1-a
cd /opt/ioio/frontend
sudo docker stop ioio-frontend
sudo docker rm ioio-frontend
sudo docker build --no-cache -t ioio-frontend .
sudo docker run -d --name ioio-frontend --restart unless-stopped -p 3000:3000 ioio-frontend
```

---

## 📊 Endpoints API Disponibles

Una vez desplegado, tendrás acceso a:

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/activities` | Listar actividades activas | No |
| GET | `/api/activities?active=false` | Listar todas las actividades | Admin |
| GET | `/api/activities/:id` | Obtener actividad por ID | No |
| POST | `/api/activities` | Crear actividad | Admin |
| PUT | `/api/activities/:id` | Actualizar actividad | Admin |
| DELETE | `/api/activities/:id` | Eliminar actividad | Admin |

---

## 🎯 Próximos Pasos

1. ✅ Aplicar la migración de base de datos
2. ✅ Actualizar el código en los servidores
3. ✅ Verificar que todo funcione correctamente
4. 📝 Crear contenido de actividades desde el panel admin
5. 🎨 Personalizar el diseño si es necesario

---

## 💡 Recomendaciones

- **Backup**: Siempre haz un backup de la base de datos antes de aplicar migraciones
- **Testing**: Prueba primero en un ambiente de desarrollo
- **Monitoreo**: Revisa los logs después del despliegue
- **Rollback**: Ten un plan de rollback en caso de problemas

```bash
# Backup de la base de datos
gcloud sql export sql ioio-postgres gs://YOUR_BUCKET/backup-$(date +%Y%m%d).sql \
  --database=ioio_db
```

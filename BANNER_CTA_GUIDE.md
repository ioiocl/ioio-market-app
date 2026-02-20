# Guía: Call-to-Action (CTA) en Banners

Esta guía explica cómo usar la nueva funcionalidad de **botones de llamada a la acción configurables** en los banners del home.

## 🎯 Características

Los banners ahora soportan:
- ✅ **Texto del botón personalizable** (en español e inglés)
- ✅ **URL de acción configurable** (rutas internas o URLs externas)
- ✅ **Activación/desactivación** del botón por banner
- ✅ **Detección automática** de URLs externas (se abren en nueva pestaña)

---

## 📋 Campos Agregados

### Base de Datos
- `cta_text_en` - Texto del botón en inglés
- `cta_text_es` - Texto del botón en español
- `cta_url` - URL de destino del botón
- `show_cta` - Mostrar/ocultar el botón (boolean)

---

## 🚀 Cómo Aplicar la Migración

### Opción 1: Base de Datos Existente (Producción)

```bash
# Conectarse a Cloud SQL
gcloud sql connect ioio-postgres --user=postgres

# En PostgreSQL:
\c ioio_db
\i database/migration_add_banner_cta.sql
\q
```

### Opción 2: Desarrollo Local con Docker

```bash
# Aplicar migración al contenedor local
docker-compose exec backend node -e "
const { pool } = require('./src/infrastructure/database/postgres');
const fs = require('fs');
const sql = fs.readFileSync('./database/migration_add_banner_cta.sql', 'utf8');
pool.query(sql).then(() => {
  console.log('✅ Migración aplicada');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
"
```

### Opción 3: Despliegue Nuevo

Si estás haciendo un despliegue completamente nuevo, los campos CTA ya están incluidos en `database/init.sql`.

---

## 🎨 Cómo Usar en el Panel de Administración

### 1. Acceder al Panel de Banners

```
http://tu-dominio.com/admin/banners
```

### 2. Crear o Editar un Banner

1. Haz clic en **"Agregar Nuevo"** o **"Editar"** en un banner existente
2. Completa los campos básicos (Título, Imagen, Orden)
3. En la sección **"Call-to-Action (Botón)"**:
   - ✅ Marca **"Mostrar botón de acción"**
   - Ingresa el **texto del botón** (ej: "Comprar Ahora", "Ver Más", "Explorar")
   - Ingresa la **URL de acción**

### 3. Tipos de URLs Soportadas

#### Rutas Internas (navegación dentro de la app)
```
/products
/events
/experiments
/actividades
/cart
```

#### URLs Externas (se abren en nueva pestaña)
```
https://www.ejemplo.com
https://tienda.ioio.cl/productos
https://instagram.com/ioio
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Banner de Productos
```
Título: "Nueva Colección 2026"
Texto del Botón: "Comprar Ahora"
URL de Acción: /products
```

### Ejemplo 2: Banner de Evento
```
Título: "Concierto en Vivo"
Texto del Botón: "Comprar Entradas"
URL de Acción: /events/123
```

### Ejemplo 3: Banner con Link Externo
```
Título: "Síguenos en Instagram"
Texto del Botón: "Ver Perfil"
URL de Acción: https://instagram.com/ioio
```

### Ejemplo 4: Banner sin Botón
```
Título: "Bienvenidos a IOIO"
Mostrar botón: ❌ (desactivado)
```

---

## 🔧 Despliegue a Producción

### Paso 1: Hacer Commit de los Cambios

```bash
git add .
git commit -m "Add CTA (Call-to-Action) functionality to banners"
git push origin main
```

### Paso 2: Aplicar Migración en Cloud SQL

```bash
# Conectar a la base de datos
gcloud sql connect ioio-postgres --user=postgres

# Aplicar migración
\c ioio_db
\i database/migration_add_banner_cta.sql
```

### Paso 3: Actualizar Servidores

```bash
# Backend
gcloud compute ssh ioio-backend --zone=us-central1-a
cd /opt/ioio
sudo git pull origin main
cd backend
sudo docker restart ioio-backend
exit

# Frontend
gcloud compute ssh ioio-frontend --zone=us-central1-a
cd /opt/ioio
sudo git pull origin main
cd frontend
sudo docker restart ioio-frontend
exit
```

---

## ✅ Verificación

### 1. Verificar Base de Datos

```sql
-- Ver estructura de la tabla
\d banners

-- Debería mostrar los nuevos campos:
-- cta_text_en, cta_text_es, cta_url, show_cta
```

### 2. Verificar Panel Admin

1. Accede a `/admin/banners`
2. Crea o edita un banner
3. Verifica que aparezca la sección "Call-to-Action (Botón)"

### 3. Verificar Frontend

1. Accede a la página principal `/`
2. Crea un banner con CTA habilitado
3. Verifica que el botón aparezca en el banner
4. Haz clic para verificar que la navegación funciona

---

## 🎯 Comportamiento del Botón

### URLs Internas (`/products`, `/events`)
- ✅ Navegación con React Router
- ✅ No recarga la página
- ✅ Mantiene el estado de la aplicación

### URLs Externas (`https://...`)
- ✅ Se abre en nueva pestaña
- ✅ Incluye `rel="noopener noreferrer"` por seguridad
- ✅ No afecta la navegación actual

---

## 🎨 Estilos del Botón

El botón CTA tiene los siguientes estilos:
- Fondo: `bg-cyber-blue` (azul neón)
- Hover: `hover:bg-cyber-pink` (rosa neón)
- Sombra: `shadow-lg hover:shadow-cyber-blue/50`
- Texto: Negro (`text-cyber-black`)
- Padding: `px-8 py-3`
- Border radius: `rounded-lg`

---

## 📊 Estructura de Datos

### Respuesta de la API

```json
{
  "banners": [
    {
      "id": "uuid",
      "title": "Nueva Colección",
      "imageUrl": "https://...",
      "linkUrl": "/products",
      "displayOrder": 1,
      "isActive": true,
      "ctaText": "Comprar Ahora",
      "ctaUrl": "/products",
      "showCta": true
    }
  ]
}
```

---

## 🔍 Troubleshooting

### El botón no aparece en el banner

**Verificar:**
1. ✅ `show_cta` está en `true`
2. ✅ `cta_text_es` tiene contenido
3. ✅ `cta_url` tiene contenido
4. ✅ La migración se aplicó correctamente

### El botón no navega correctamente

**Para URLs internas:**
- Asegúrate de que la ruta existe en `App.jsx`
- Verifica que empiece con `/`

**Para URLs externas:**
- Asegúrate de que empiece con `http://` o `https://`

### Los cambios no se reflejan en producción

```bash
# Limpiar cache del navegador
# O forzar recarga: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

# Verificar que el código se actualizó:
gcloud compute ssh ioio-frontend --zone=us-central1-a
cd /opt/ioio
git log -1
```

---

## 📝 Archivos Modificados

### Backend
- `database/migration_add_banner_cta.sql` - Migración SQL
- `database/init.sql` - Schema actualizado
- `backend/src/infrastructure/repositories/PostgresBannerRepository.js` - Repositorio
- `backend/src/infrastructure/http/controllers/ContentController.js` - Controller

### Frontend
- `frontend/src/pages/Admin/Banners.jsx` - Panel admin
- `frontend/src/pages/Home.jsx` - Visualización del banner

---

## 🎉 Próximos Pasos

1. ✅ Aplicar la migración a la base de datos
2. ✅ Desplegar los cambios a producción
3. 📝 Crear banners con CTAs personalizados
4. 🎨 Personalizar los estilos si es necesario
5. 📊 Monitorear el engagement de los CTAs

# Guía de Páginas Personalizadas

## Descripción

El sistema de páginas personalizadas permite crear y editar contenido dinámico para páginas como "Servicios" y "Actividades" directamente desde el panel de administración.

## Características

- ✅ Contenido editable en español e inglés
- ✅ Soporte para HTML en el contenido
- ✅ Imagen principal (hero)
- ✅ Galería de imágenes adicionales
- ✅ Control de visibilidad (activa/inactiva)
- ✅ URLs personalizables (slug)

## Estructura de la Base de Datos

### Tabla: `custom_pages`

```sql
- id: UUID (Primary Key)
- slug: VARCHAR(100) UNIQUE (URL de la página, ej: "servicios", "actividades")
- title_en: VARCHAR(255) (Título en inglés)
- title_es: VARCHAR(255) (Título en español)
- content_en: TEXT (Contenido HTML en inglés)
- content_es: TEXT (Contenido HTML en español)
- image_url: VARCHAR(500) (URL de la imagen principal)
- images: JSONB (Array de URLs de imágenes adicionales)
- is_active: BOOLEAN (Si la página está visible)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Configuración Inicial

### 1. Actualizar la Base de Datos

Ejecuta las migraciones en tu base de datos:

```bash
# Conectarse a la base de datos
psql -U ioio_user -d ioio_db

# Ejecutar el script de inicialización (si es una instalación nueva)
\i database/init.sql

# O ejecutar solo la migración de custom_pages
CREATE TABLE IF NOT EXISTS custom_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_es VARCHAR(255) NOT NULL,
    content_en TEXT,
    content_es TEXT,
    image_url VARCHAR(500),
    images JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Insertar páginas iniciales
\i database/seed_custom_pages.sql
```

### 2. Reiniciar el Backend

```bash
cd backend
npm start
```

## Uso del Panel de Administración

### Acceder al Panel

1. Inicia sesión como administrador en: `https://ioio.cl/login`
2. Ve al panel de administración: `https://ioio.cl/admin`
3. Haz clic en "Páginas Personalizadas"

### Crear una Nueva Página

1. Haz clic en el botón "Nueva Página"
2. Completa el formulario:
   - **Slug**: URL de la página (ej: "servicios", "actividades", "nosotros")
   - **Título (Español)**: Título visible en español
   - **Título (Inglés)**: Título visible en inglés
   - **Contenido (Español)**: Contenido HTML en español
   - **Contenido (Inglés)**: Contenido HTML en inglés
   - **Imagen Principal**: Imagen hero (opcional)
   - **Galería**: Imágenes adicionales (opcional)
   - **Página Activa**: Marcar para hacer visible la página

3. Haz clic en "Crear Página"

### Editar una Página Existente

1. En la lista de páginas, haz clic en el botón de editar (lápiz)
2. Modifica los campos necesarios
3. Haz clic en "Actualizar Página"

### Eliminar una Página

1. En la lista de páginas, haz clic en el botón de eliminar (papelera)
2. Confirma la eliminación

## Formato del Contenido

El contenido soporta HTML. Aquí hay algunos ejemplos:

### Títulos y Párrafos

```html
<h2>Título Principal</h2>
<p>Este es un párrafo de texto.</p>

<h3>Subtítulo</h3>
<p>Otro párrafo con más información.</p>
```

### Listas

```html
<ul>
  <li>Elemento 1</li>
  <li>Elemento 2</li>
  <li>Elemento 3</li>
</ul>

<ol>
  <li>Primer paso</li>
  <li>Segundo paso</li>
  <li>Tercer paso</li>
</ol>
```

### Enlaces

```html
<a href="https://ejemplo.com">Visita nuestro sitio</a>
```

### Imágenes en el Contenido

```html
<img src="https://ejemplo.com/imagen.jpg" alt="Descripción" />
```

### Formato de Texto

```html
<strong>Texto en negrita</strong>
<em>Texto en cursiva</em>
<u>Texto subrayado</u>
```

## API Endpoints

### Públicos (sin autenticación)

```
GET /api/pages                    - Obtener todas las páginas activas
GET /api/pages/slug/:slug         - Obtener página por slug
GET /api/pages/:id                - Obtener página por ID
```

### Administración (requiere autenticación admin)

```
POST   /api/pages                 - Crear nueva página
PUT    /api/pages/:id             - Actualizar página
DELETE /api/pages/:id             - Eliminar página
```

## Agregar Nuevas Páginas al Menú

Para agregar una nueva página al menú de navegación:

### 1. Crear la Página en el Admin

Primero crea la página desde el panel de administración con el slug deseado (ej: "nosotros")

### 2. Agregar Ruta en App.jsx

```javascript
// En frontend/src/App.jsx
import NuevaPage from './pages/NuevaPage';

// Agregar en las rutas
<Route path="/nueva-pagina" element={<NuevaPage />} />
```

### 3. Crear Componente de Página

```javascript
// En frontend/src/pages/NuevaPage.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { customPageService } from '../api/services';

function NuevaPage() {
  const { i18n } = useTranslation();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      const res = await customPageService.getBySlug('nueva-pagina');
      setPageData(res.data.page);
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center">
      <div className="text-2xl neon-text">Cargando...</div>
    </div>;
  }

  if (!pageData) {
    return <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-4 neon-text">Nueva Página</h1>
      <p className="text-gray-400">Contenido no disponible</p>
    </div>;
  }

  const title = i18n.language === 'es' ? pageData.titleEs : pageData.titleEn;
  const content = i18n.language === 'es' ? pageData.contentEs : pageData.contentEn;

  return (
    <div className="min-h-screen">
      {pageData.imageUrl && (
        <section className="relative h-96 overflow-hidden mb-8">
          <img src={pageData.imageUrl} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
            <h1 className="text-5xl md:text-7xl font-bold neon-text">{title}</h1>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-12">
        {!pageData.imageUrl && (
          <h1 className="text-5xl font-bold mb-8 neon-text text-center">{title}</h1>
        )}

        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {pageData.images && pageData.images.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageData.images.map((image, index) => (
                <div key={index} className="cyber-card rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${title} ${index + 1}`}
                    className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NuevaPage;
```

### 4. Agregar al Menú de Navegación

```javascript
// En frontend/src/components/Layout/Header.jsx

// Desktop menu
<Link to="/nueva-pagina" className="hover:text-cyber-blue transition-colors">
  Nueva Página
</Link>

// Mobile menu
<Link
  to="/nueva-pagina"
  className="hover:text-cyber-blue transition-colors"
  onClick={() => setMobileMenuOpen(false)}
>
  Nueva Página
</Link>
```

## Páginas Incluidas

### 1. Servicios (`/servicios`)
- Slug: `servicios`
- Descripción: Página para mostrar los servicios ofrecidos

### 2. Actividades (`/actividades`)
- Slug: `actividades`
- Descripción: Página para mostrar las actividades organizadas

## Troubleshooting

### La página no aparece

1. Verifica que la página esté marcada como "Activa" en el admin
2. Verifica que el slug sea correcto
3. Revisa la consola del navegador para errores

### El contenido no se muestra correctamente

1. Verifica que el HTML sea válido
2. Revisa que no haya caracteres especiales sin escapar
3. Usa la vista previa del navegador para verificar el HTML

### Las imágenes no se cargan

1. Verifica que las URLs de las imágenes sean accesibles
2. Asegúrate de que las imágenes estén subidas correctamente
3. Revisa los permisos del bucket de almacenamiento

## Soporte

Para más ayuda, contacta al equipo de desarrollo o consulta la documentación completa del proyecto.

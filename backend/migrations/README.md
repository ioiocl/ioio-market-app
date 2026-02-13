# Database Migrations

## Activities Table Migration

Para crear la tabla de actividades en la base de datos, ejecuta:

```bash
node migrations/run-activities-migration.js
```

Este script creará la tabla `activities` con los siguientes campos:
- `id` - Identificador único (auto-incremental)
- `title_en` - Título en inglés
- `title_es` - Título en español
- `description_en` - Descripción en inglés
- `description_es` - Descripción en español
- `content_en` - Contenido completo en inglés
- `content_es` - Contenido completo en español
- `image_url` - URL de la imagen principal
- `images` - Array JSON de URLs de imágenes adicionales
- `is_active` - Estado activo/inactivo
- `created_at` - Fecha de creación
- `updated_at` - Fecha de última actualización

## Índices

La tabla incluye índices en:
- `is_active` - Para consultas rápidas de actividades activas
- `created_at` - Para ordenamiento por fecha de creación

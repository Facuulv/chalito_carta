# Auditoría del Backend - chalito_backend

## Estructura de base de datos

- **Motor**: MySQL
- **Archivo schema**: `chalito_backend/18-2-26.sql`

### Tablas relevantes para catálogo

| Tabla | Campos principales | Descripción |
|-------|--------------------|-------------|
| `categorias` | id, nombre, descripcion, orden, activo | Categorías de productos |
| `articulos` | id, categoria_id, nombre, descripcion, precio, imagen_url, activo, tipo | Productos |
| `adicionales` | id, nombre, descripcion, precio_extra, disponible | Extras/adicionales |
| `adicionales_contenido` | id, adicional_id, articulo_id | Relación N:M producto-extras |

### Relaciones

- `articulos.categoria_id` → `categorias.id`
- `adicionales_contenido.articulo_id` → `articulos.id`
- `adicionales_contenido.adicional_id` → `adicionales.id`

---

## Endpoints existentes (carta pública)

Se crearon rutas públicas en `/carta-publica` que reutilizan la lógica de los controladores existentes, sin autenticación.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/carta-publica/categorias` | Lista de categorías |
| GET | `/carta-publica/articulos?categoria=X&disponible=true` | Productos (opcional: filtrar por categoría) |
| GET | `/carta-publica/articulos/:id` | Detalle de producto |
| GET | `/carta-publica/articulos/:id/adicionales` | Extras del producto |

### Ejemplo de responses

**GET /carta-publica/categorias**
```json
[
  { "id": 1, "nombre": "Hamburguesas", "descripcion": null, "orden": 0 },
  { "id": 2, "nombre": "Bebidas", "descripcion": null, "orden": 1 }
]
```

**GET /carta-publica/articulos**
```json
[
  {
    "id": 1,
    "categoria_id": 1,
    "nombre": "Chalito Doble",
    "descripcion": "Doble carne...",
    "precio": 12500,
    "imagen_url": "https://res.cloudinary.com/...",
    "activo": 1,
    "categoria_nombre": "Hamburguesas"
  }
]
```

**GET /carta-publica/articulos/:id/adicionales**
```json
{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Extra cheddar", "precio_extra": 800, "disponible": 1 }
  ]
}
```

---

## Imágenes

- Las imágenes se almacenan en **Cloudinary**.
- `articulos.imagen_url` contiene la URL completa (ej: `https://res.cloudinary.com/...`).
- No hay ruta de assets en el backend; las URLs son absolutas.

---

## Configuración

En `chalito_carta` crear `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Reemplazar `4000` por el puerto donde corre el backend (ver `chalito_backend/.env` → `PORT`).

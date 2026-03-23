# Capa de catálogo - useCatalogStore

## Archivos creados/modificados

| Archivo | Acción |
|---------|--------|
| `src/store/useCatalogStore.js` | **Nuevo** - Store con cache, dedupe, TTL |
| `src/lib/mappers/catalogMapper.js` | **Nuevo** - Mapeo backend → UI |
| `src/app/page.jsx` | Modificado - Consume store, skeletons, retry por sección |
| `src/app/producto/[slug]/page.jsx` | Modificado - Consume store, skeleton detalle |

## Dedupe + cache

### Deduplicación
- `inflight: Record<string, Promise>` guarda las promises en vuelo.
- Claves: `categories`, `products:all`, `products:<catId>`, `detail:<prodId>`.
- Si un componente pide datos ya en fetch, recibe la misma promise (no lanza request nuevo).

### Cache
- **Categorías**: una vez cargadas, se cachean. No refetch al volver al Home.
- **Productos**: cache bajo `"all"` (todos). Filtrado por categoría y búsqueda en cliente.
- **Detalle**: cache por `productId`. Al volver atrás y reabrir el mismo producto, usa cache.

### Reglas
- Si `status === 'success'` y `force === false` → **no refetch**.
- Si hay `inflight[key]` → **reutilizar** esa promise.
- Si falla → `status = 'error'`, se guarda mensaje; UI muestra retry.

### TTL
- **5 minutos** por clave (`CACHE_TTL_MS`).
- Si `Date.now() - fetchedAt > TTL` → se considera expirado.
- Con `force: true` se ignora cache y TTL.

## Imágenes

- Cards: `width={88} height={88}` + `h-[5.5rem] w-[5.5rem]` para evitar layout shift.
- Hero y detalle: `width`/`height` explícitos.
- Placeholder inline SVG en `onError`.

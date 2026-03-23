# Carta online - Sistema El Chalito 🍔

Frontend público de la **carta online** de El Chalito.  
Permite ver categorías y productos, armar el pedido y avanzar por el flujo de checkout, consumiendo la API del backend bajo el prefijo `/carta-publica`.

---

## Descripción

Esta aplicación está pensada para clientes finales (sin panel interno). Centraliza:

- catálogo por categorías y detalle de producto
- búsqueda de productos
- carrito persistente (Zustand)
- checkout y página de finalización (datos del cliente, entrega, horario, pago)
- estado de local (horarios / cerrado) y mensajes acordes

Se integra con el mismo **chalito_backend** que el sistema interno, reutilizando reglas de negocio y datos de productos.

---

## Tecnologías utilizadas

- **Next.js** (App Router, `src/app`)
- **React**
- **Tailwind CSS** v4
- **Axios** — cliente HTTP
- **Zustand** — carrito y catálogo (cache, dedupe, TTL)
- **React Hook Form** + **Zod** — formularios y validación
- **Sonner** — notificaciones
- **Lucide React** / **React Icons**
- **Embla Carousel** — carruseles (hero, etc.)

---

## Instalación

```bash
npm install
```

---

## Configuración

Crear archivo `.env.local` en la raíz del proyecto:

```env
# URL base del backend (sin barra final). El cliente usa el prefijo /carta-publica automáticamente.
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
# Alternativa compatible con el frontend interno:
# NEXT_PUBLIC_API_URL=http://localhost:3001

NEXT_PUBLIC_APP_NAME=El Chalito
```

El cliente HTTP (`src/services/apiClient.js`) resuelve la base como `NEXT_PUBLIC_API_BASE_URL` o `NEXT_PUBLIC_API_URL` y añade `/carta-publica` a las rutas.

> Recomendación: no subir secretos ni URLs de producción sensibles al repositorio.

---

## Ejecución

### Desarrollo

```bash
npm run dev
```

Por defecto el servidor de desarrollo escucha en **http://localhost:3000** (ver script en `package.json`).

### Producción

```bash
npm run build
npm start
```

---

## Estructura del proyecto

```text
chalito_carta/
├── config/                 # Configuración raíz (ej. medios de pago)
├── docs/                   # Notas técnicas (catálogo, auditoría backend)
├── public/                 # Estáticos e imágenes
├── src/
│   ├── app/                # App Router (páginas y layouts)
│   │   ├── page.jsx        # Inicio / catálogo
│   │   ├── layout.jsx
│   │   ├── globals.css
│   │   ├── buscar/
│   │   ├── categoria/[slug]/
│   │   ├── producto/[slug]/
│   │   └── checkout/       # Carrito y finalización
│   ├── components/         # UI (producto, checkout, layout, skeletons, etc.)
│   ├── hooks/              # Hooks (producto, checkout, tienda, carga)
│   ├── store/              # Zustand (catálogo, carrito)
│   ├── services/           # API (catálogo, pedidos públicos)
│   ├── lib/                # Mappers, utilidades de imágenes, scroll
│   ├── utils/              # Formato, carrito, checkout, horarios
│   ├── constants/
│   └── config/             # Config local (ej. horarios de tienda)
├── next.config.mjs         # Imágenes remotas (Cloudinary, etc.)
└── package.json
```

> Más detalle sobre la capa de catálogo: [docs/CATALOG_STORE.md](./docs/CATALOG_STORE.md).

---

## Características principales

- Catálogo con cache en cliente (TTL y deduplicación de requests)
- Rutas por categoría y slug de producto
- Carrito y flujo de checkout alineado con pedidos públicos del backend
- UI responsive, skeletons y estados de error con reintento donde aplica
- Imágenes optimizadas con `next/image` y patrones remotos configurados

---

## Scripts disponibles

```bash
npm run dev      # Desarrollo (puerto 3000 por defecto)
npm run build    # Build de producción
npm start        # Servidor de producción
npm run lint     # ESLint
```

---

## Integración con el ecosistema

| Proyecto | Rol |
|----------|-----|
| **chalito_backend** | API REST + MySQL; expone `/carta-publica` para esta app |
| **chalito_nextjs** | Sistema web interno (admin / operación); misma API base distinta UX |

Convivencia en local típica: backend en `3001`, carta en `3000`, frontend interno en otro puerto si corrés los tres a la vez.

---

## Documentación adicional

- [docs/CATALOG_STORE.md](./docs/CATALOG_STORE.md) — store de catálogo, cache y TTL
- [docs/AUDITORIA_BACKEND.md](./docs/AUDITORIA_BACKEND.md) — notas de alineación con backend

---

## Licencia y contacto

Este proyecto es propiedad de **El Chalito**.  
Para soporte o consultas, contactar al equipo de desarrollo.

---

**Sistema Chalito** — Carta online

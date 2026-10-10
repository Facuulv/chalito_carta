/**
 * Imagen de las cards de categoría del home.
 * Prioridad: imagen cargada en el admin → foto de un producto de la categoría → fallback fijo.
 */

/** Preferencia de producto por categoría (slug del producto a buscar) */
const PREFERRED_PRODUCT_SLUG = {
  empanadas: "empanada-jamonyqueso",
  sandwiches: "milanesa",
  sándwiches: "milanesa",
};

const FALLBACKS = {
  hamburguesas:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=90",
  sandwiches:
    "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=900&q=90",
  empanadas: "/empanada-jamonyqueso.png",
  papas: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=900&q=90",
  pizzas: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=900&q=90",
  bebidas:
    "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=900&q=90",
};

/** Imágenes locales con prioridad sobre las fotos de productos (no sobre la del admin) */
const LOCAL_IMAGES = {
  empanadas: "/empanada-jamonyqueso.png",
};

export function getCategoryImageFromProducts(categoria, productos = []) {
  if (!categoria) return null;
  if (categoria.imagen_url) return categoria.imagen_url;

  const catNombre = (categoria.nombre ?? "").trim().toLowerCase();
  const catId = categoria.id;
  const catSlug = (categoria.slug ?? catNombre).toLowerCase().replace(/\s+/g, "");

  if (LOCAL_IMAGES[catSlug]) return LOCAL_IMAGES[catSlug];

  const byCat = productos.filter((p) => {
    const pCat = p.categoria_id ?? p.categoria_nombre;
    return pCat === catId || (pCat && String(pCat).toLowerCase() === catNombre);
  });

  const preferredSlug = PREFERRED_PRODUCT_SLUG[catSlug];
  if (preferredSlug) {
    const preferred = byCat.find(
      (p) =>
        p.imagen_url &&
        (String(p.slug ?? "").toLowerCase().includes(preferredSlug) ||
          String(p.nombre ?? "").toLowerCase().includes(preferredSlug))
    );
    if (preferred?.imagen_url) return preferred.imagen_url;
  }

  const withImg = byCat.find((p) => p.imagen_url);
  if (withImg?.imagen_url) return withImg.imagen_url;

  return FALLBACKS[catSlug] ?? FALLBACKS.bebidas;
}

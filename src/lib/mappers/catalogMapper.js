/**
 * Mapeo backend → UI para catálogo.
 * Normaliza nombres de campos y genera slugs.
 */

function toSlug(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mapCategory(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id ?? raw.categoria_id;
  const nombre = raw.nombre ?? "";
  return {
    id,
    nombre,
    slug: raw.slug ?? (toSlug(nombre) || String(id)),
    descripcion: raw.descripcion ?? null,
    orden: raw.orden ?? 0,
  };
}

export function mapProduct(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id;
  const nombre = raw.nombre ?? "";
  return {
    id,
    nombre,
    slug: raw.slug ?? String(id),
    precio: Number(raw.precio) || 0,
    imagen_url: raw.imagen_url ?? null,
    descripcion: raw.descripcion ?? null,
    categoria_id: raw.categoria_id ?? null,
    categoria_nombre: raw.categoria_nombre ?? null,
  };
}

export function mapProductDetail(raw, extras = []) {
  if (!raw || typeof raw !== "object") return null;
  const base = mapProduct(raw);
  if (!base) return null;
  return {
    ...base,
    extras: Array.isArray(extras) ? extras : [],
  };
}

export function mapExtra(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id,
    nombre: raw.nombre ?? "",
    precio: Number(raw.precio_extra ?? raw.precio) || 0,
  };
}

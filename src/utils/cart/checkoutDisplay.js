export function getPresentacionLabel(nombre) {
  const n = (nombre ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (n === "hacela doble") return "DOBLE";
  if (n === "hacela triple") return "TRIPLE";
  if (n === "hacela cuadruple") return "CUÁDRUPLE";
  return null;
}

export function isHamburguesas(categoriaNombre) {
  return (categoriaNombre ?? "").toLowerCase().includes("hamburguesa");
}

export const CANTIDAD_EXTRA_MAX = 99;

export function getExtraCantidad(extra) {
  const n = Number(extra?.cantidad);
  if (!Number.isInteger(n) || n < 1) return 1;
  return Math.min(CANTIDAD_EXTRA_MAX, n);
}

export function formatExtraNombre(extra) {
  const nombre = extra?.nombre ?? "";
  const qty = getExtraCantidad(extra);
  return qty > 1 ? `${nombre} x${qty}` : nombre;
}

export function getExtraLineTotal(extra) {
  const precio = Number(extra?.precioExtra ?? extra?.precio ?? 0);
  return precio * getExtraCantidad(extra);
}

export function mapExtrasToCheckoutPayload(extras = []) {
  return (extras ?? [])
    .filter((e) => typeof e === "object" && e != null && "id" in e)
    .map((e) => ({
      id: Number(e.id),
      cantidad: getExtraCantidad(e),
    }))
    .filter((e) => Number.isFinite(e.id) && e.id > 0);
}

export function getExtrasFingerprint(item) {
  const ex = item?.extrasSeleccionados ?? item?.extras ?? [];
  return [...ex]
    .map((e) => {
      const id =
        typeof e === "object" && e != null && "id" in e ? Number(e.id) : Number(e);
      const cantidad = typeof e === "object" && e != null ? getExtraCantidad(e) : 1;
      return `${id}:${cantidad}`;
    })
    .sort()
    .join("|");
}

export function splitExtrasForHamburguesa(extras) {
  const presentacion = [];
  const otros = [];
  for (const e of extras) {
    const label = getPresentacionLabel(e?.nombre);
    if (label) presentacion.push(label);
    else otros.push(e);
  }
  return { presentacion, otros };
}

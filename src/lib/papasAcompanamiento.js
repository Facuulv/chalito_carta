function normalizeProductName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Papas elegibles como acompañamiento en hamburguesas/sándwiches.
 * Solo porciones clásicas; el resto se compra en la categoría PAPAS.
 */
export function isPorcionPapasClasicas(product) {
  const name = normalizeProductName(product?.nombre);
  return (
    name.includes("porcion") &&
    name.includes("papa") &&
    name.includes("clasica")
  );
}

export function filterPapasAcompanamiento(products = []) {
  if (!Array.isArray(products)) return [];
  return products.filter(isPorcionPapasClasicas);
}

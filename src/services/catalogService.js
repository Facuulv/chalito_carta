import apiClient from "./apiClient";

/**
 * Obtiene todas las categorías activas.
 * @returns {Promise<Array<{id: number, nombre: string, descripcion?: string, orden?: number}>>}
 */
export async function getCategories() {
  const { data } = await apiClient.get("/categorias");
  return data;
}

/**
 * Obtiene artículos (productos) filtrados por categoría.
 * @param {number|string} categoryId - ID o nombre de categoría
 * @param {boolean} [disponible=true] - Solo artículos activos
 * @returns {Promise<Array>}
 */
export async function getProductsByCategory(categoryId, disponible = true) {
  const params = { disponible: disponible.toString() };
  if (categoryId != null && categoryId !== "") {
    params.categoria = categoryId;
  }
  const { data } = await apiClient.get("/articulos", { params });
  return data;
}

/**
 * Obtiene detalle de un artículo por ID.
 * @param {number|string} productId
 * @returns {Promise<Object>}
 */
export async function getProductDetail(productId) {
  const { data } = await apiClient.get(`/articulos/${productId}`);
  return data;
}

/**
 * Obtiene los adicionales (extras) de un artículo.
 * @param {number|string} productId
 * @returns {Promise<Array<{id: number, nombre: string, precio_extra: number, disponible: number}>>}
 */
export async function getExtrasByProduct(productId) {
  const { data } = await apiClient.get(`/articulos/${productId}/adicionales`);
  const raw = data?.data ?? data ?? [];
  return raw
    .filter((a) => a.disponible !== 0)
    .map((a) => ({
      id: a.id,
      nombre: a.nombre,
      precio: Number(a.precio_extra) || 0,
    }));
}

/**
 * Búsqueda de productos por nombre.
 * El backend no tiene endpoint de búsqueda; se filtra en cliente.
 * @param {string} query
 * @param {Array} allProducts - Lista de productos para filtrar
 * @returns {Array}
 */
export function searchProducts(query, allProducts = []) {
  if (!query || !query.trim()) return allProducts;
  const q = query.trim().toLowerCase();
  return allProducts.filter((p) =>
    (p.nombre || "").toLowerCase().includes(q)
  );
}

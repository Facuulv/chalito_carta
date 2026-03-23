/**
 * Store de catálogo con cache en memoria, deduplicación y estados por sección.
 * Reutiliza catalogService; no mezcla UI con datos.
 *
 * AUDITORÍA - Puntos mejorados vs estado anterior:
 * - Fetch: Antes Home hacía fetchCatalog() en cada mount; Detalle refetch en cada visita.
 *   Ahora: cache por sección, no refetch si success y force=false.
 * - Dedupe: Antes requests duplicados si dos componentes pedían lo mismo.
 *   Ahora: inflight[key] reutiliza la misma promise.
 * - Estados: Antes loading/error globales. Ahora por sección (categories, products, detail).
 * - TTL: 5 min por clave; si expiró, refetch con force.
 */

import { create } from "zustand";
import {
  getCategories,
  getProductsByCategory,
  getProductDetail,
  getExtrasByProduct,
} from "@/services/catalogService";
import { mapCategory, mapProduct, mapProductDetail, mapExtra } from "@/lib/mappers/catalogMapper";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

const STATUS = Object.freeze({
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error",
});

function isExpired(fetchedAt) {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt > CACHE_TTL_MS;
}

const EMPTY_ARRAY = [];

export const useCatalogStore = create((set, get) => ({
  // --- Categorías ---
  categories: [],
  categoriesStatus: STATUS.idle,
  categoriesError: null,
  categoriesFetchedAt: null,

  // --- Productos por categoría (key: "all" | categoryId) ---
  productsByCategoryId: {},
  productsStatusByCategoryId: {},
  productsErrorByCategoryId: {},
  productsFetchedAtByCategoryId: {},

  // --- Detalle de producto (key: productId) ---
  productDetailById: {},
  productDetailStatusById: {},
  productDetailErrorById: {},
  productDetailFetchedAtById: {},

  // --- Dedupe: promises en vuelo ---
  inflight: {},

  // --- Acciones ---

  fetchCategories: async ({ force = false } = {}) => {
    const state = get();
    const key = "categories";

    if (!force && state.categoriesStatus === STATUS.success && !isExpired(state.categoriesFetchedAt)) {
      return;
    }
    if (state.inflight[key]) {
      return state.inflight[key];
    }

    const promise = (async () => {
      set({ categoriesStatus: STATUS.loading, categoriesError: null });

      try {
        const data = await getCategories();
        const mapped = (Array.isArray(data) ? data : []).map(mapCategory).filter(Boolean);
        set((s) => {
          const nextInflight = { ...s.inflight };
          delete nextInflight[key];
          return {
            categories: mapped,
            categoriesStatus: STATUS.success,
            categoriesError: null,
            categoriesFetchedAt: Date.now(),
            inflight: nextInflight,
          };
        });
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Error al cargar categorías";
        set((s) => {
          const nextInflight = { ...s.inflight };
          delete nextInflight[key];
          return {
            categoriesStatus: STATUS.error,
            categoriesError: msg,
            inflight: nextInflight,
          };
        });
      }
    })();

    set((s) => ({ inflight: { ...s.inflight, [key]: promise } }));
    return promise;
  },

  fetchProductsByCategory: async (categoryId, { force = false } = {}) => {
    const key = categoryId == null || categoryId === "" ? "all" : String(categoryId);
    const state = get();

    const status = state.productsStatusByCategoryId[key];
    const fetchedAt = state.productsFetchedAtByCategoryId[key];

    if (!force && status === STATUS.success && !isExpired(fetchedAt)) {
      return;
    }
    if (state.inflight[`products:${key}`]) {
      return state.inflight[`products:${key}`];
    }

    const promise = (async () => {
      set((s) => ({
        productsStatusByCategoryId: { ...s.productsStatusByCategoryId, [key]: STATUS.loading },
        productsErrorByCategoryId: { ...s.productsErrorByCategoryId, [key]: null },
      }));

      try {
        const data = await getProductsByCategory(
          key === "all" ? null : categoryId,
          true
        );
        const mapped = (Array.isArray(data) ? data : []).map(mapProduct).filter(Boolean);

        set((s) => {
          const nextInflight = { ...s.inflight };
          delete nextInflight[`products:${key}`];
          return {
            productsByCategoryId: { ...s.productsByCategoryId, [key]: mapped },
            productsStatusByCategoryId: { ...s.productsStatusByCategoryId, [key]: STATUS.success },
            productsErrorByCategoryId: { ...s.productsErrorByCategoryId, [key]: null },
            productsFetchedAtByCategoryId: { ...s.productsFetchedAtByCategoryId, [key]: Date.now() },
            inflight: nextInflight,
          };
        });
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Error al cargar productos";
        set((s) => {
          const nextInflight = { ...s.inflight };
          delete nextInflight[`products:${key}`];
          return {
            productsStatusByCategoryId: { ...s.productsStatusByCategoryId, [key]: STATUS.error },
            productsErrorByCategoryId: { ...s.productsErrorByCategoryId, [key]: msg },
            inflight: nextInflight,
          };
        });
      }
    })();

    set((s) => ({ inflight: { ...s.inflight, [`products:${key}`]: promise } }));
    return promise;
  },

  fetchProductDetail: async (productId, { force = false } = {}) => {
    const key = String(productId);
    const state = get();

    const status = state.productDetailStatusById[key];
    const fetchedAt = state.productDetailFetchedAtById[key];

    if (!force && status === STATUS.success && !isExpired(fetchedAt)) {
      return;
    }
    if (state.inflight[`detail:${key}`]) {
      return state.inflight[`detail:${key}`];
    }

    const promise = (async () => {
      set((s) => ({
        productDetailStatusById: { ...s.productDetailStatusById, [key]: STATUS.loading },
        productDetailErrorById: { ...s.productDetailErrorById, [key]: null },
      }));

      try {
        const [detail, extrasData] = await Promise.all([
          getProductDetail(productId),
          getExtrasByProduct(productId),
        ]);
        const extras = (Array.isArray(extrasData) ? extrasData : []).map(mapExtra).filter(Boolean);
        const mapped = mapProductDetail(detail, extras);

        set((s) => {
          const nextInflight = { ...s.inflight };
          delete nextInflight[`detail:${key}`];
          return {
            productDetailById: { ...s.productDetailById, [key]: mapped },
            productDetailStatusById: { ...s.productDetailStatusById, [key]: STATUS.success },
            productDetailErrorById: { ...s.productDetailErrorById, [key]: null },
            productDetailFetchedAtById: { ...s.productDetailFetchedAtById, [key]: Date.now() },
            inflight: nextInflight,
          };
        });
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Error al cargar el producto";
        set((s) => {
          const nextInflight = { ...s.inflight };
          delete nextInflight[`detail:${key}`];
          return {
            productDetailStatusById: { ...s.productDetailStatusById, [key]: STATUS.error },
            productDetailErrorById: { ...s.productDetailErrorById, [key]: msg },
            inflight: nextInflight,
          };
        });
      }
    })();

    set((s) => ({ inflight: { ...s.inflight, [`detail:${key}`]: promise } }));
    return promise;
  },
}));

// --- Selectores ---

export const selectCategories = (state) => state.categories;

export const selectProductsForCategory = (state, categoryId) => {
  const key = categoryId == null || categoryId === "" ? "all" : String(categoryId);
  const arr = state.productsByCategoryId[key];
  return arr && arr.length > 0 ? arr : EMPTY_ARRAY;
};

export const selectProductDetail = (state, productId) => {
  const key = String(productId);
  return state.productDetailById[key] ?? null;
};

export const selectCategoriesLoading = (state) => state.categoriesStatus === STATUS.loading;
export const selectCategoriesError = (state) => state.categoriesError;
export const selectCategoriesSuccess = (state) => state.categoriesStatus === STATUS.success;

export const selectProductsLoading = (state, categoryId) => {
  const key = categoryId == null || categoryId === "" ? "all" : String(categoryId);
  return state.productsStatusByCategoryId[key] === STATUS.loading;
};

export const selectProductsError = (state, categoryId) => {
  const key = categoryId == null || categoryId === "" ? "all" : String(categoryId);
  return state.productsErrorByCategoryId[key] ?? null;
};

export const selectProductDetailLoading = (state, productId) => {
  const key = String(productId);
  return state.productDetailStatusById[key] === STATUS.loading;
};

export const selectProductDetailError = (state, productId) => {
  const key = String(productId);
  return state.productDetailErrorById[key] ?? null;
};

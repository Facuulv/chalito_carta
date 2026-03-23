import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isStoreOpen } from "@/utils/storeSchedule";

/**
 * Shape definitivo de item de carrito:
 * - id: id interno único del carrito
 * - articuloId: id real DB
 * - slug: string
 * - nombre: string
 * - precioBase: number
 * - extrasSeleccionados: Array<{ id: number, nombre: string, precioExtra: number }>
 * - observaciones: string
 * - cantidad: number
 * - precioUnitario: number = precioBase + sum(extrasSeleccionados.precioExtra)
 * - subtotal: number = precioUnitario * cantidad
 */

// Normaliza extras para comparar si dos items son el mismo producto+extras
const getExtraIds = (item) => {
  const ex = item.extrasSeleccionados ?? item.extras ?? [];
  return [...ex]
    .map((e) => (typeof e === "object" && e != null && "id" in e ? e.id : Number(e)))
    .sort((a, b) => a - b);
};

const areSameExtras = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

const getItemQuantity = (item) => item.cantidad ?? item.quantity ?? 1;

const getExtrasPriceSum = (item) => {
  const ex = item.extrasSeleccionados ?? item.extras ?? [];
  return ex.reduce((acc, e) => {
    const p = typeof e === "object" && e != null ? (e.precioExtra ?? e.precio ?? 0) : 0;
    return acc + Number(p);
  }, 0);
};

/** Deriva precioUnitario para items viejos (legacy) */
export const getItemUnitPrice = (item) => {
  if (item.precioUnitario != null) return Number(item.precioUnitario);
  const base = Number(item.precioBase ?? 0);
  const extras = getExtrasPriceSum(item);
  return base + extras;
};

/** Deriva subtotal para items viejos (legacy) */
export const getItemSubtotal = (item) => {
  if (item.subtotal != null) return Number(item.subtotal);
  return getItemUnitPrice(item) * getItemQuantity(item);
};

export const selectCartItems = (state) => state.items;
export const selectCartTotal = (state) =>
  state.items.reduce((acc, item) => acc + getItemSubtotal(item), 0);
export const selectSearchQuery = (state) => state.searchQuery;

export const useCarritoStore = create(
  persist(
    (set) => ({
      items: [],
      searchQuery: "",

      addItem: (item) => {
        if (!isStoreOpen()) return;
        set((state) => {
      const incomingExtras = item.extrasSeleccionados ?? [];
      const incomingIds = getExtraIds({ extrasSeleccionados: incomingExtras });

      const existingIndex = state.items.findIndex((currentItem) => {
        const currentIds = getExtraIds(currentItem);
        return (
          currentItem.slug === item.slug &&
          (currentItem.articuloId ?? currentItem.slug) === (item.articuloId ?? item.slug) &&
          areSameExtras(currentIds, incomingIds)
        );
      });

      const cantidad = item.cantidad ?? 1;
      const precioBase = Number(item.precioBase ?? 0);
      const extrasSum = incomingExtras.reduce(
        (acc, e) => acc + Number(e.precioExtra ?? e.precio ?? 0),
        0
      );
      const precioUnitario = precioBase + extrasSum;
      const subtotal = precioUnitario * cantidad;

      const newItem = {
        id: item.id ?? `${item.articuloId ?? item.slug}-${Date.now()}`,
        articuloId: item.articuloId ?? (item.slug ? Number(item.slug) || item.slug : null),
        slug: item.slug ?? String(item.articuloId ?? ""),
        nombre: item.nombre ?? "Producto",
        precioBase,
        extrasSeleccionados: incomingExtras,
        observaciones: item.observaciones ?? "",
        cantidad,
        precioUnitario,
        subtotal,
        categoria_nombre: item.categoria_nombre ?? null,
        imagen_url: item.imagen_url ?? null,
      };

      if (existingIndex !== -1) {
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingIndex];
        const nextCantidad = getItemQuantity(existingItem) + cantidad;
        const existingUnitPrice = getItemUnitPrice(existingItem);

        updatedItems[existingIndex] = {
          ...existingItem,
          cantidad: nextCantidad,
          quantity: nextCantidad,
          subtotal: existingUnitPrice * nextCantidad,
        };

        return { items: updatedItems };
      }

      return {
        items: [...state.items, newItem],
      };
    });
      },

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.id !== id) };
      }

      return {
        items: state.items.map((item) =>
          item.id === id
            ? {
                ...item,
                cantidad: quantity,
                quantity: quantity,
                subtotal: getItemUnitPrice(item) * quantity,
              }
            : item
        ),
      };
    }),

  clearCart: () => set({ items: [] }),

  setSearchQuery: (value) => set({ searchQuery: value }),
  clearSearch: () => set({ searchQuery: "" }),
    }),
    {
      name: "chalito-carrito",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

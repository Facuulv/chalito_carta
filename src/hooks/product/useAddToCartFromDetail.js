import { toast } from "sonner";

export function useAddToCartFromDetail({
  producto,
  isOpen,
  presentacionCantidades,
  presentacion,
  todosAdicionales,
  extrasSeleccionados,
  observaciones,
  categorias,
  papasSeleccionadas,
  papasProductos,
  categoriaPapas,
  addItem,
  navigatingRef,
  router,
}) {
  return () => {
    if (!producto || navigatingRef.current) return;
    if (!isOpen) {
      toast.info("No estamos tomando pedidos en este momento.");
      return;
    }

    const totalItems =
      (presentacionCantidades.simple ?? 0) +
      (presentacionCantidades.doble ?? 0) +
      (presentacionCantidades.triple ?? 0);
    if (totalItems === 0) return;

    navigatingRef.current = true;

    const presIds = [presentacion.doble?.id, presentacion.triple?.id].filter(Boolean);
    const otrosExtras = todosAdicionales
      .filter((e) => extrasSeleccionados.includes(e.id) && !presIds.includes(e.id))
      .map((e) => ({
        id: e.id,
        nombre: e.nombre ?? "",
        precioExtra: Number(e.precio ?? e.precio_extra ?? 0),
      }));

    if (presentacionCantidades.simple > 0) {
      addItem({
        articuloId: producto.id,
        slug: `${producto.id}-simple`,
        nombre: producto.nombre,
        precioBase: Number(producto.precio),
        extrasSeleccionados: otrosExtras,
        observaciones,
        cantidad: presentacionCantidades.simple,
        categoria_nombre:
          producto.categoria_nombre ??
          categorias.find((c) => c.id === producto.categoria_id)?.nombre,
        imagen_url: producto.imagen_url,
      });
    }

    if (presentacionCantidades.doble > 0 && presentacion.doble) {
      addItem({
        articuloId: producto.id,
        slug: `${producto.id}-doble`,
        nombre: producto.nombre,
        precioBase: Number(producto.precio),
        extrasSeleccionados: [
          ...otrosExtras,
          {
            id: presentacion.doble.id,
            nombre: presentacion.doble.nombre ?? "",
            precioExtra: Number(
              presentacion.doble.precio ?? presentacion.doble.precioExtra ?? 0
            ),
          },
        ],
        observaciones,
        cantidad: presentacionCantidades.doble,
        categoria_nombre:
          producto.categoria_nombre ??
          categorias.find((c) => c.id === producto.categoria_id)?.nombre,
        imagen_url: producto.imagen_url,
      });
    }

    if (presentacionCantidades.triple > 0 && presentacion.triple) {
      addItem({
        articuloId: producto.id,
        slug: `${producto.id}-triple`,
        nombre: producto.nombre,
        precioBase: Number(producto.precio),
        extrasSeleccionados: [
          ...otrosExtras,
          {
            id: presentacion.triple.id,
            nombre: presentacion.triple.nombre ?? "",
            precioExtra: Number(
              presentacion.triple.precio ?? presentacion.triple.precioExtra ?? 0
            ),
          },
        ],
        observaciones,
        cantidad: presentacionCantidades.triple,
        categoria_nombre:
          producto.categoria_nombre ??
          categorias.find((c) => c.id === producto.categoria_id)?.nombre,
        imagen_url: producto.imagen_url,
      });
    }

    for (const [pid, cantidad] of Object.entries(papasSeleccionadas)) {
      if (cantidad <= 0) continue;
      const p = papasProductos.find((x) => x.id === Number(pid));
      if (!p) continue;
      addItem({
        articuloId: p.id,
        slug: String(p.id),
        nombre: p.nombre,
        precioBase: Number(p.precio),
        extrasSeleccionados: [],
        observaciones: "",
        cantidad,
        categoria_nombre: p.categoria_nombre ?? categoriaPapas?.nombre,
        imagen_url: p.imagen_url,
      });
    }

    setTimeout(() => router.back(), 220);
  };
}

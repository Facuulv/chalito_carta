import { useMemo } from "react";

export function useProductPricing({
  producto,
  presentacion,
  presentacionCantidades,
  papasSeleccionadas,
  papasProductos,
  todosAdicionales,
  extrasCantidades,
}) {
  const precioSimple = Number(producto?.precio ?? 0);
  const precioDoble = presentacion.doble
    ? precioSimple +
      Number(presentacion.doble.precio ?? presentacion.doble.precioExtra ?? 0)
    : 0;
  const precioTriple = presentacion.triple
    ? precioSimple +
      Number(presentacion.triple.precio ?? presentacion.triple.precioExtra ?? 0)
    : 0;
  const precioCuadruple = presentacion.cuadruple
    ? precioSimple +
      Number(presentacion.cuadruple.precio ?? presentacion.cuadruple.precioExtra ?? 0)
    : 0;

  const totalPresentacion = useMemo(() => {
    if (!producto) return 0;
    const { simple, doble, triple, cuadruple } = presentacionCantidades;
    return (
      simple * precioSimple +
      doble * precioDoble +
      triple * precioTriple +
      cuadruple * precioCuadruple
    );
  }, [
    producto,
    presentacionCantidades,
    precioSimple,
    precioDoble,
    precioTriple,
    precioCuadruple,
  ]);

  const totalPapas = useMemo(
    () =>
      Object.entries(papasSeleccionadas).reduce(
        (acc, [id, qty]) =>
          acc +
          qty * Number(papasProductos.find((p) => p.id === Number(id))?.precio ?? 0),
        0
      ),
    [papasSeleccionadas, papasProductos]
  );

  const extrasTotal = useMemo(
    () =>
      Object.entries(extrasCantidades ?? {}).reduce((acc, [id, qty]) => {
        const cantidad = Math.max(1, Number(qty) || 1);
        const extra = todosAdicionales.find((e) => String(e.id) === String(id));
        if (!extra) return acc;
        return acc + Number(extra.precio ?? extra.precioExtra ?? 0) * cantidad;
      }, 0),
    [extrasCantidades, todosAdicionales]
  );

  const precioUnitario = useMemo(() => {
    const totalItems =
      (presentacionCantidades.simple ?? 0) +
      (presentacionCantidades.doble ?? 0) +
      (presentacionCantidades.triple ?? 0) +
      (presentacionCantidades.cuadruple ?? 0);

    return (
      totalPresentacion + (totalItems > 0 ? totalItems * extrasTotal : 0) + totalPapas
    );
  }, [totalPresentacion, extrasTotal, presentacionCantidades, totalPapas]);

  return {
    precioSimple,
    precioDoble,
    precioTriple,
    precioCuadruple,
    totalPresentacion,
    totalPapas,
    precioUnitario,
  };
}

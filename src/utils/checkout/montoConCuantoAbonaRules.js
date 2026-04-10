/**
 * Debe mantenerse alineado con `chalito_backend/services/montoConCuantoAbonaRules.js`
 * (misma regla de negocio para UX en carta y validación en servidor).
 *
 * Ver documentación de reglas en ese archivo.
 */
export const EXCESO_MINIMO_ABSOLUTO_ARS = 50_000;
export const FRACCION_EXCESO_SOBRE_TOTAL = 0.75;
const EPS_MONTO = 0.01;

function roundMontoArs(n) {
  return Math.round(Number(n) * 100) / 100;
}

export function formatMontoMensaje(n) {
  const r = roundMontoArs(n);
  return `$${r.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
}

export function computeMaxMontoConCuantoAbona(totalPedido) {
  const t = roundMontoArs(totalPedido);
  if (!Number.isFinite(t) || t <= 0) return 0;
  const exceso = Math.max(
    EXCESO_MINIMO_ABSOLUTO_ARS,
    Math.round(t * FRACCION_EXCESO_SOBRE_TOTAL)
  );
  return roundMontoArs(t + exceso);
}

/**
 * @param {number|null} monto
 * @param {number} cartTotal
 * @returns {string|null} Mensaje de error o null si válido
 */
export function getMontoConCuantoAbonaEfectivoError(monto, cartTotal) {
  const total = roundMontoArs(cartTotal);
  if (monto === null || !Number.isFinite(monto)) {
    return "Ingresá con cuánto abonás (solo números).";
  }
  const m = roundMontoArs(monto);
  if (m <= 0) {
    return "Ingresá con cuánto abonás (solo números).";
  }
  if (!Number.isFinite(total) || total <= 0) {
    return null;
  }
  if (m < total - EPS_MONTO) {
    return `El monto debe ser al menos el total del pedido (${formatMontoMensaje(total)}).`;
  }
  const maxPermitido = computeMaxMontoConCuantoAbona(total);
  if (m > maxPermitido + EPS_MONTO) {
    return `El monto es demasiado alto para este pedido (total ${formatMontoMensaje(total)}). Podés indicar hasta ${formatMontoMensaje(maxPermitido)}. Si necesitás otra opción, contactá al local.`;
  }
  return null;
}

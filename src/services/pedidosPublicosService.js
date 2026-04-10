/**
 * Crea un pedido público en el backend.
 * POST {NEXT_PUBLIC_API_BASE_URL}/carta-publica/pedidos
 *
 * @param {Object} payload
 * @param {Object} payload.customer - { nombre, telefono, email? }
 * @param {string} payload.deliveryType - "DELIVERY" | "RETIRO"
 * @param {string} [payload.address] - Solo si DELIVERY
 * @param {string} payload.paymentMethod
 * @param {string} [payload.notes]
 * @param {string} [payload.prioridad] - "NORMAL" por defecto
 * @param {string} payload.when - "CUANTO_ANTES" | "HORA_PROGRAMADA"
 * @param {string} [payload.scheduledTime] - ISO datetime, solo si when === "HORA_PROGRAMADA" (backend guarda en horario_entrega)
 * @param {Array} payload.items - [{ productId, quantity, selectedExtras }]
 * @returns {Promise<{ success: boolean, pedidoId: number, estado: string, total?: number }>}
 * @throws {Error} Con mensaje legible si response no ok
 */
export async function crearPedidoPublico(payload) {
  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL no configurada");
  }
  const url = `${baseURL.replace(/\/$/, "")}/carta-publica/pedidos`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationDetails = Array.isArray(data?.errors) ? data.errors : [];
    const detailMessage =
      validationDetails.length > 0
        ? String(validationDetails[0]).replace(/^[^.]*:\s*/, "")
        : null;
    const msg =
      detailMessage ??
      data?.message ??
      data?.error ??
      data?.mensaje ??
      `Error ${response.status}`;
    const error = new Error(msg);
    error.details = validationDetails;
    throw error;
  }

  return data;
}

/**
 * Inicia checkout de Mercado Pago y devuelve URL de pago.
 * POST {BASE_URL}/api/carta-publica/checkout/mercadopago
 */
export async function crearCheckoutMercadoPago(payload) {
  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL no configurada");
  }

  const normalizedBase = baseURL.replace(/\/$/, "");
  const usesApiPrefix = /\/api$/i.test(normalizedBase);
  const endpointPath = usesApiPrefix
    ? "/carta-publica/checkout/mercadopago"
    : "/api/carta-publica/checkout/mercadopago";
  const url = `${normalizedBase}${endpointPath}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      data?.message ??
      data?.error ??
      data?.mensaje ??
      "No pudimos iniciar el pago con Mercado Pago. Intentá nuevamente.";
    throw new Error(msg);
  }

  return data;
}

/**
 * Consulta estado real de pago/pedido para una orden.
 * GET {BASE_URL}/api/carta-publica/pedidos/:pedidoId/estado-pago
 */
export async function obtenerEstadoPagoPedido(pedidoId) {
  if (!pedidoId) {
    throw new Error("Falta el identificador del pedido.");
  }

  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL no configurada");
  }

  const normalizedBase = baseURL.replace(/\/$/, "");
  const usesApiPrefix = /\/api$/i.test(normalizedBase);
  const endpointPath = usesApiPrefix
    ? `/carta-publica/pedidos/${encodeURIComponent(pedidoId)}/estado-pago`
    : `/api/carta-publica/pedidos/${encodeURIComponent(pedidoId)}/estado-pago`;
  const url = `${normalizedBase}${endpointPath}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      data?.message ??
      data?.error ??
      data?.mensaje ??
      "No pudimos verificar el estado del pago.";
    throw new Error(msg);
  }

  return data;
}

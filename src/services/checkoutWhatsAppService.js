function buildCartaPublicaPath(suffixPath) {
  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL no configurada");
  }
  const normalizedBase = baseURL.replace(/\/$/, "");
  const usesApiPrefix = /\/api$/i.test(normalizedBase);
  const endpointPath = usesApiPrefix
    ? `/carta-publica${suffixPath}`
    : `/api/carta-publica${suffixPath}`;
  return `${normalizedBase}${endpointPath}`;
}

/**
 * Obtiene enlace wa.me para que el cliente envíe el pedido al local.
 * GET /carta-publica/pedidos/:pedidoId/whatsapp-cliente
 *
 * @param {number|string} pedidoId
 * @returns {Promise<{ success: boolean, activo: boolean, urlWaMe?: string, mensaje?: string }>}
 */
export async function obtenerWhatsAppClientePedido(pedidoId) {
  const id = String(pedidoId ?? "").trim();
  if (!id) {
    throw new Error("Falta el identificador del pedido.");
  }

  const url = buildCartaPublicaPath(
    `/pedidos/${encodeURIComponent(id)}/whatsapp-cliente`
  );

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      data?.message ??
      data?.error ??
      "No pudimos obtener el enlace de WhatsApp.";
    throw new Error(msg);
  }

  return data;
}

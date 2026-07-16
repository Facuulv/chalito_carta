import { buildCartaPublicaPath } from "@/utils/api/cartaPublicaPath";

const DEFAULT_TIMEOUT_MS = 12000;

/**
 * Obtiene enlace wa.me para que el cliente envíe el pedido al local.
 * GET /carta-publica/pedidos/:pedidoId/whatsapp-cliente
 *
 * @param {number|string} pedidoId
 * @param {{ timeoutMs?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<{
 *   success: boolean,
 *   activo: boolean,
 *   motivo?: string,
 *   urlWaMe?: string,
 *   mensaje?: string,
 *   pedidoId?: number
 * }>}
 */
export async function obtenerWhatsAppClientePedido(pedidoId, options = {}) {
  const id = String(pedidoId ?? "").trim();
  if (!id) {
    const err = new Error("Falta el identificador del pedido.");
    err.code = "pedido_invalido";
    throw err;
  }

  const url = buildCartaPublicaPath(
    `/pedidos/${encodeURIComponent(id)}/whatsapp-cliente`
  );

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg =
        data?.message ??
        data?.error ??
        "No pudimos obtener el enlace de WhatsApp.";
      const err = new Error(msg);
      err.code = data?.motivo || `http_${response.status}`;
      err.status = response.status;
      err.motivo = data?.motivo || null;
      throw err;
    }

    return {
      success: Boolean(data?.success ?? true),
      activo: Boolean(data?.activo),
      motivo: data?.motivo || null,
      urlWaMe: data?.urlWaMe || null,
      mensaje: data?.mensaje || null,
      pedidoId: data?.pedidoId ?? Number(id),
      numero: data?.numero || null,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      const err = new Error("La solicitud de WhatsApp tardó demasiado. Reintentá.");
      err.code = "timeout";
      err.motivo = "timeout";
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

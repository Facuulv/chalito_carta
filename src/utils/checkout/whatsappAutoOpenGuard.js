const STORAGE_PREFIX = "chalito_wa_opened_";

export function shouldAutoOpenWhatsApp(pedidoId) {
  if (typeof window === "undefined") return false;
  const id = Number(pedidoId);
  if (!Number.isFinite(id) || id <= 0) return false;
  try {
    return sessionStorage.getItem(`${STORAGE_PREFIX}${id}`) !== "1";
  } catch {
    return true;
  }
}

export function markWhatsAppAutoOpened(pedidoId) {
  if (typeof window === "undefined") return;
  const id = Number(pedidoId);
  if (!Number.isFinite(id) || id <= 0) return;
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${id}`, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Mensajes de UX según motivo del backend / error de red.
 */
export function resolveWhatsAppClienteMessage(motivo) {
  switch (String(motivo || "").trim().toLowerCase()) {
    case "feature_desactivada":
      return "Tu pedido ya quedó registrado en el local. El local te contactará si hace falta.";
    case "sin_numero":
      return "Tu pedido ya quedó registrado. WhatsApp del local no está disponible en este momento.";
    case "pedido_no_encontrado":
      return "No encontramos el pedido para armar el mensaje de WhatsApp.";
    case "pago_pendiente":
      return "Estamos confirmando tu pago. En cuanto se acredite vas a poder enviar el resumen por WhatsApp.";
    case "timeout":
      return "No pudimos preparar el enlace de WhatsApp a tiempo.";
    case "error_servidor":
      return "Hubo un problema al preparar WhatsApp.";
    default:
      return "No pudimos preparar el enlace de WhatsApp.";
  }
}

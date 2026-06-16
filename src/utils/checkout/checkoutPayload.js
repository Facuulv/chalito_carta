import { getItemQuantity } from "@/utils/cart/cartItem";
import { mapExtrasToCheckoutPayload } from "@/utils/cart/checkoutDisplay";

function parseBackendNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildScheduledTimeIso(horarioProgramado) {
  if (!horarioProgramado) return undefined;
  const [hh, mm] = horarioProgramado.split(":").map(Number);
  const now = new Date();
  const scheduled = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hh ?? 0,
    mm ?? 0
  );
  return scheduled.toISOString();
}

export function buildCheckoutPayload({ normalized, items, couponCode }) {
  const when = normalized.cuando; // "CUANTO_ANTES" | "HORA_PROGRAMADA"
  const scheduledTime =
    when === "HORA_PROGRAMADA"
      ? buildScheduledTimeIso(normalized.horarioProgramado)
      : undefined;

  const payload = {
    customer: {
      nombre: normalized.nombre,
      telefono: normalized.telefono,
      email: normalized.email,
    },
    deliveryType: normalized.deliveryType,
    ...(normalized.address && { address: normalized.address }),
    paymentMethod: normalized.paymentMethod,
    notes: normalized.notes,
    prioridad: "NORMAL",
    when,
    ...(when === "HORA_PROGRAMADA" && scheduledTime && { scheduledTime }),
    items: items.map((item) => ({
      productId: item.articuloId,
      quantity: getItemQuantity(item),
      selectedExtras: mapExtrasToCheckoutPayload(
        item.extrasSeleccionados ?? item.extras ?? []
      ),
      itemNotes: (item.observaciones ?? "").trim(),
    })),
    ...(normalized.paymentMethod === "EFECTIVO" &&
      normalized.efectivoConCuanto != null && {
        conCuantoAbona: normalized.efectivoConCuanto,
        cashGiven: normalized.efectivoConCuanto,
      }),
    ...(couponCode && { couponCode }),
  };

  return { payload, when, scheduledTime };
}

export function buildMercadoPagoCheckoutPayload({ normalized, items, couponCode }) {
  const isScheduledDelivery = normalized.cuando === "HORA_PROGRAMADA";

  return {
    cliente: {
      nombre: normalized.nombre,
      telefono: normalized.telefono,
      email: normalized.email,
      direccion: normalized.address ?? null,
    },
    pedido: {
      modalidad: normalized.deliveryType,
      observaciones: normalized.notes,
      horario_entrega: isScheduledDelivery ? normalized.horarioProgramado : null,
      prioridad: "ALTA",
      medio_pago: "MERCADOPAGO",
    },
    items: items.map((item) => ({
      articulo_id: item.articuloId,
      cantidad: getItemQuantity(item),
      observaciones: (item.observaciones ?? "").trim() || null,
      extras: mapExtrasToCheckoutPayload(item.extrasSeleccionados ?? item.extras ?? []),
    })),
    ...(couponCode && { couponCode }),
  };
}

export function resolveCreatedOrderMeta(data) {
  const pedidoId = data?.pedidoId ?? data?.id ?? data?.data?.id ?? data?.pedido?.id;
  const estado = data?.estado ?? "RECIBIDO";
  return { pedidoId, estado };
}

export function resolveOrderTotals(data, fallbackSubtotal) {
  const deliveryCost =
    parseBackendNumber(data?.deliveryCost) ??
    parseBackendNumber(data?.costoEnvio) ??
    parseBackendNumber(data?.shippingCost) ??
    parseBackendNumber(data?.pedido?.deliveryCost) ??
    parseBackendNumber(data?.pedido?.costoEnvio) ??
    parseBackendNumber(data?.pedido?.shippingCost) ??
    0;

  const backendTotal =
    parseBackendNumber(data?.total) ??
    parseBackendNumber(data?.totalPedido) ??
    parseBackendNumber(data?.pedido?.total);

  const totalFinal = backendTotal ?? fallbackSubtotal + deliveryCost;
  return { deliveryCost, totalFinal };
}

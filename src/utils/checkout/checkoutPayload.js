import { getItemQuantity } from "@/utils/cart/cartItem";

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

export function buildCheckoutPayload({ normalized, items }) {
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
      selectedExtras: (item.extrasSeleccionados ?? item.extras ?? []).map((e) =>
        typeof e === "object" && e != null && "id" in e ? e.id : Number(e)
      ),
      itemNotes: (item.observaciones ?? "").trim(),
    })),
    ...(normalized.paymentMethod === "EFECTIVO" &&
      normalized.efectivoConCuanto != null && {
        conCuantoAbona: normalized.efectivoConCuanto,
        cashGiven: normalized.efectivoConCuanto,
      }),
  };

  return { payload, when, scheduledTime };
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

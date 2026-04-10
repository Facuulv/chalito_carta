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

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function getExtraPrice(extra) {
  if (!extra || typeof extra !== "object") return 0;
  return Number(extra.precioExtra ?? extra.precio ?? 0);
}

function getItemSubtotalFromCart(item) {
  const explicitSubtotal = Number(item?.subtotal);
  if (Number.isFinite(explicitSubtotal)) return roundMoney(explicitSubtotal);

  const quantity = Number(getItemQuantity(item));
  const explicitUnitPrice = Number(item?.precioUnitario);
  if (Number.isFinite(explicitUnitPrice) && Number.isFinite(quantity)) {
    return roundMoney(explicitUnitPrice * quantity);
  }

  const base = Number(item?.precioBase ?? 0);
  const extras = (item?.extrasSeleccionados ?? item?.extras ?? []).reduce(
    (acc, extra) => acc + getExtraPrice(extra),
    0
  );
  return roundMoney((base + extras) * quantity);
}

function getSafeQuantity(item) {
  const quantity = Number(getItemQuantity(item));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function resolveFinalTotal(items, displayedTotal) {
  const itemsTotal = roundMoney(
    items.reduce((acc, item) => acc + getItemSubtotalFromCart(item), 0)
  );
  const visibleTotal = Number(displayedTotal);
  if (Number.isFinite(visibleTotal)) {
    return roundMoney(visibleTotal);
  }
  return itemsTotal;
}

export function buildCheckoutPayload({ normalized, items, displayedTotal }) {
  const when = normalized.cuando; // "CUANTO_ANTES" | "HORA_PROGRAMADA"
  const scheduledTime =
    when === "HORA_PROGRAMADA"
      ? buildScheduledTimeIso(normalized.horarioProgramado)
      : undefined;
  const total = resolveFinalTotal(items, displayedTotal);

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
    total,
    items: items.map((item) => ({
      productId: item.articuloId,
      quantity: getSafeQuantity(item),
      unitPrice: roundMoney(getItemSubtotalFromCart(item) / getSafeQuantity(item)),
      subtotal: getItemSubtotalFromCart(item),
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

export function buildMercadoPagoCheckoutPayload({ normalized, items, displayedTotal }) {
  const isScheduledDelivery = normalized.cuando === "HORA_PROGRAMADA";
  const total = resolveFinalTotal(items, displayedTotal);

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
      total,
    },
    items: items.map((item) => ({
      articulo_id: item.articuloId,
      cantidad: getSafeQuantity(item),
      subtotal: getItemSubtotalFromCart(item),
      observaciones: (item.observaciones ?? "").trim() || null,
      extras: (item.extrasSeleccionados ?? item.extras ?? [])
        .map((extra) =>
          typeof extra === "object" && extra != null && "id" in extra ? Number(extra.id) : Number(extra)
        )
        .filter(Number.isFinite)
        .map((id) => ({ id })),
    })),
  };
}

export function resolveCreatedOrderMeta(data) {
  const pedidoId = data?.pedidoId ?? data?.id ?? data?.data?.id ?? data?.pedido?.id;
  const estado = data?.estado ?? "RECIBIDO";
  return { pedidoId, estado };
}

export function resolveOrderTotals(data, fallbackSubtotal) {
  const backendTotal =
    parseBackendNumber(data?.total) ??
    parseBackendNumber(data?.totalPedido) ??
    parseBackendNumber(data?.pedido?.total);

  const totalFinal = backendTotal ?? fallbackSubtotal;
  return { deliveryCost: 0, totalFinal };
}

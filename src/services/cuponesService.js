import { getItemQuantity } from "@/utils/cart/cartItem";
import { mapExtrasToCheckoutPayload } from "@/utils/cart/checkoutDisplay";

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

export function mapCartItemsToCouponPayload(items = []) {
  return items.map((item) => ({
    productId: item.articuloId,
    quantity: getItemQuantity(item),
    selectedExtras: mapExtrasToCheckoutPayload(
      item.extrasSeleccionados ?? item.extras ?? []
    ),
    itemNotes: (item.observaciones ?? "").trim() || null,
  }));
}

/**
 * Valida cupón y devuelve quote (sin redimir).
 */
export async function validarCupon({ couponCode, items }) {
  const url = buildCartaPublicaPath("/cupones/validar");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ couponCode, items }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.valid) {
    const msg = data?.message || "Cupón no válido";
    const error = new Error(msg);
    error.valid = false;
    throw error;
  }

  return data;
}

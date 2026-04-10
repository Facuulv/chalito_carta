import { useCarritoStore } from "@/store/useCarritoStore";

const LEGACY_CHECKOUT_ADDRESS_KEYS = ["checkout_direccion", "checkout_address"];

/**
 * Limpia el carrito persistido y claves legacy de dirección en sessionStorage
 * cuando el backend confirma pago aprobado (PAGADO).
 */
export function resetClientStateAfterApprovedPayment() {
  useCarritoStore.getState().clearCart();
  try {
    for (const key of LEGACY_CHECKOUT_ADDRESS_KEYS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

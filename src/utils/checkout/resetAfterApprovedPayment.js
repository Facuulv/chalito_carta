import { useCarritoStore } from "@/store/useCarritoStore";

/**
 * Limpia el carrito persistido cuando el backend confirma pago aprobado (PAGADO).
 */
export function resetClientStateAfterApprovedPayment() {
  useCarritoStore.getState().clearCart();
}

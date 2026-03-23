import { useCallback } from "react";
import { toast } from "sonner";
import { crearPedidoPublico } from "@/services/pedidosPublicosService";
import { validateCheckoutForm } from "@/utils/checkoutValidations";
import {
  buildCheckoutPayload,
  resolveCreatedOrderMeta,
} from "@/utils/checkout/checkoutPayload";
import { isStoreHoursValidationEnabled } from "@/config/storeHoursConfig";

export function useCheckoutSubmit({
  items,
  total,
  isOpen,
  hasInvalidItems,
  isSubmitting,
  metodoPago,
  montoEfectivoInputRef,
  setFieldErrors,
  setIsSubmitting,
  setPedidoCreado,
  clearCart,
  formValues,
}) {
  return useCallback(async () => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío.");
      return;
    }
    const shouldValidateStoreHours = isStoreHoursValidationEnabled();

    if (!isOpen && shouldValidateStoreHours) {
      toast.error("El local está cerrado. No se pueden enviar pedidos en este momento.");
      return;
    }
    if (hasInvalidItems || isSubmitting) return;

    setFieldErrors({});

    const { ok, errors, firstError, normalized } = validateCheckoutForm(formValues, total);

    if (!ok) {
      setFieldErrors(errors);
      toast.error(firstError);
      const firstKey = Object.keys(errors)[0];
      const el = document.getElementById(`checkout-${firstKey}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { payload } = buildCheckoutPayload({
        normalized,
        items,
      });

      const data = await crearPedidoPublico(payload);
      const { pedidoId, estado } = resolveCreatedOrderMeta(data);

      setPedidoCreado({ id: pedidoId, estado });
      clearCart();
    } catch (err) {
      const backendMessage = err?.message ?? "Error al crear el pedido. Intentá de nuevo.";
      const msgLower = backendMessage.toLowerCase();
      const isCashValidationError =
        metodoPago === "efectivo" &&
        (msgLower.includes("concuantoabona") ||
          msgLower.includes("cashgiven") ||
          msgLower.includes("efectivo"));

      if (isCashValidationError) {
        const efectivoError = "Ingresá un monto válido para efectivo.";
        setFieldErrors((prev) => ({ ...prev, montoEfectivo: efectivoError }));
        toast.error(efectivoError);
        const el = document.getElementById("checkout-montoEfectivo");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        montoEfectivoInputRef.current?.focus();
      } else {
        toast.error(backendMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    items,
    isOpen,
    hasInvalidItems,
    isSubmitting,
    setFieldErrors,
    formValues,
    total,
    setIsSubmitting,
    clearCart,
    setPedidoCreado,
    metodoPago,
    montoEfectivoInputRef,
  ]);
}

import { useCallback } from "react";
import { toast } from "sonner";
import {
  crearCheckoutMercadoPago,
  crearPedidoPublico,
} from "@/services/pedidosPublicosService";
import { validateCheckoutForm } from "@/utils/checkoutValidations";
import {
  buildMercadoPagoCheckoutPayload,
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
      if (metodoPago === "mercadopago") {
        const payloadMercadoPago = buildMercadoPagoCheckoutPayload({
          normalized,
          items,
        });
        const mpResponse = await crearCheckoutMercadoPago(payloadMercadoPago);
        const urlPago = mpResponse?.data?.url_pago ?? mpResponse?.url_pago;

        if (!urlPago || typeof urlPago !== "string") {
          throw new Error(
            "No recibimos una URL de pago válida. Intentá nuevamente en unos instantes."
          );
        }

        window.location.href = urlPago;
        return;
      }

      const { payload } = buildCheckoutPayload({ normalized, items });
      const data = await crearPedidoPublico(payload);
      const { pedidoId, estado } = resolveCreatedOrderMeta(data);
      setPedidoCreado({ id: pedidoId, estado });
      clearCart();
    } catch (err) {
      const backendMessage =
        err?.message ??
        (metodoPago === "mercadopago"
          ? "No pudimos iniciar el pago con Mercado Pago. Intentá nuevamente."
          : "Error al crear el pedido. Intentá de nuevo.");
      const msgLower = backendMessage.toLowerCase();
      const isCashValidationError =
        metodoPago === "efectivo" &&
        (msgLower.includes("concuantoabona") ||
          msgLower.includes("cashgiven") ||
          msgLower.includes("efectivo") ||
          (msgLower.includes("monto") &&
            (msgLower.includes("total") ||
              msgLower.includes("demasiado") ||
              msgLower.includes("menor al"))));

      if (isCashValidationError) {
        setFieldErrors((prev) => ({ ...prev, montoEfectivo: backendMessage }));
        toast.error(backendMessage);
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

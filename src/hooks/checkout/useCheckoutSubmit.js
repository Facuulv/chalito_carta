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
import { guardarDatos } from "@/hooks/checkout/useCheckoutPersistence";

export function useCheckoutSubmit({
  items,
  total,
  checkoutTotal,
  couponCode,
  isOpen,
  hasInvalidItems,
  isSubmitting,
  metodoPago,
  montoEfectivoInputRef,
  setFieldErrors,
  setIsSubmitting,
  clearCart,
  router,
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

    const totalParaValidar =
      checkoutTotal != null && Number.isFinite(Number(checkoutTotal))
        ? Number(checkoutTotal)
        : total;

    const { ok, errors, firstError, normalized } = validateCheckoutForm(
      formValues,
      totalParaValidar
    );

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
          couponCode,
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

      const { payload } = buildCheckoutPayload({ normalized, items, couponCode });
      const data = await crearPedidoPublico(payload);
      const { pedidoId } = resolveCreatedOrderMeta(data);
      guardarDatos({
        nombre: formValues.nombre,
        telefono: formValues.telefono,
        email: formValues.email,
        calle: formValues.calle,
        numeroAltura: formValues.numeroAltura,
        entreCalles: formValues.entreCalles,
        edificioCasa: formValues.edificioCasa,
        pisoDepto: formValues.pisoDepto,
      });
      clearCart();
      router.push(`/checkout/confirmado?pedido_id=${encodeURIComponent(pedidoId)}`);
      return;
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
    checkoutTotal,
    couponCode,
    setIsSubmitting,
    clearCart,
    router,
    metodoPago,
    montoEfectivoInputRef,
  ]);
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  useCarritoStore,
  selectCartItems,
  selectCartTotal,
  getItemSubtotal,
} from "@/store/useCarritoStore";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { getItemName, getItemQuantity } from "@/utils/cart/cartItem";
import CustomerSection from "@/components/checkout/finalizar/CustomerSection";
import DeliverySection from "@/components/checkout/finalizar/DeliverySection";
import ScheduleSection from "@/components/checkout/finalizar/ScheduleSection";
import PaymentSection from "@/components/checkout/finalizar/PaymentSection";
import CouponSection from "@/components/checkout/finalizar/CouponSection";
import OrderSummaryFooter from "@/components/checkout/finalizar/OrderSummaryFooter";
import { useCheckoutSubmit } from "@/hooks/checkout/useCheckoutSubmit";
import { usarDatosPrevios } from "@/hooks/checkout/useCheckoutPersistence";

const TIPOS_ENTREGA = {
  envio: "envio",
  retiro: "retiro",
};
const TIPOS_DEMORA = {
  cuantoAntes: "cuanto_antes",
  programado: "programado",
};

export default function CheckoutFinalizarPage() {
  const router = useRouter();
  const items = useCarritoStore(selectCartItems);
  const total = useCarritoStore(selectCartTotal);
  const { isOpen } = useStoreStatus();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState(TIPOS_ENTREGA.envio);
  const [calle, setCalle] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const legacy =
        sessionStorage.getItem("checkout_direccion") ||
        sessionStorage.getItem("checkout_address");
      return legacy && typeof legacy === "string" ? legacy.trim() : "";
    } catch (_) {
      return "";
    }
  });
  const [numeroAltura, setNumeroAltura] = useState("");
  const [entreCalles, setEntreCalles] = useState("");
  const [edificioCasa, setEdificioCasa] = useState("");
  const [pisoDepto, setPisoDepto] = useState("");
  const [obsEntrega, setObsEntrega] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [tipoDemora, setTipoDemora] = useState(TIPOS_DEMORA.cuantoAntes);
  const [horaProgramada, setHoraProgramada] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [resumenOpen, setResumenOpen] = useState(false);
  const [datosPrevios, setDatosPrevios] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [pricingQuote, setPricingQuote] = useState(null);
  const montoEfectivoInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const prevMetodoPagoRef = useRef(metodoPago);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setDatosPrevios(usarDatosPrevios());
  }, []);

  useEffect(() => {
    if (metodoPago === "efectivo") {
      if (prevMetodoPagoRef.current !== "efectivo") {
        montoEfectivoInputRef.current?.focus();
        montoEfectivoInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      prevMetodoPagoRef.current = "efectivo";
    } else {
      prevMetodoPagoRef.current = metodoPago;
    }
  }, [metodoPago]);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Toast solo si el usuario entra a finalizar con el carrito ya vacío (no tras enviar pedido)
  useEffect(() => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío.");
    }
    // Solo al montar la página; no reaccionar cuando el carrito se vacía por otra causa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Migración: limpiar keys legacy una vez inicializado el estado
  useEffect(() => {
    try {
      sessionStorage.removeItem("checkout_direccion");
      sessionStorage.removeItem("checkout_address");
    } catch (_) { }
  }, []);

  const isEnvio = tipoEntrega === TIPOS_ENTREGA.envio;
  const hasInvalidItems = items.some(
    (item) => item.articuloId == null || item.articuloId === undefined
  );
  const resumenItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        nombre: getItemName(item),
        cantidad: getItemQuantity(item),
        subtotal: getItemSubtotal(item),
        observaciones: (item.observaciones ?? "").trim(),
        extras: (item.extrasSeleccionados ?? item.extras ?? []).filter(
          (e) => typeof e === "object" && e != null && "nombre" in e
        ),
      })),
    [items]
  );
  const checkoutTotal = pricingQuote?.totalFinal ?? total;
  const couponCode = appliedCoupon?.codigo ?? null;

  const handleSubmit = useCheckoutSubmit({
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
    router,
    formValues: {
      nombre,
      telefono,
      email,
      tipoEntrega,
      tipoDemora,
      horarioProgramado: horaProgramada,
      calle,
      numeroAltura,
      entreCalles,
      edificioCasa,
      pisoDepto,
      obsEntrega,
      metodoPago,
      montoEfectivo,
    },
  });

  if (items.length === 0) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-neutral-100">
        <div className="app-scroll-y flex min-h-0 flex-1 flex-col px-4 py-6">
          <div className="mx-auto w-full max-w-[480px] md:max-w-3xl">
            <Link
              href="/checkout"
              className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
              aria-label="Volver al checkout"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
              Tu carrito está vacío. Volvé al checkout para agregar productos.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white"
      style={{
        fontFamily: 'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
      }}
    >
      <header className="sticky top-0 z-40 flex shrink-0 min-h-[68px] items-center gap-3 border-b border-neutral-200 bg-slate-200 px-4 py-5 shadow-sm md:px-6 lg:px-8">
        <Link
          href="/checkout"
          className="flex shrink-0 items-center justify-center header-title-color"
          aria-label="Volver al checkout"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
        <h1 className="font-anton header-title-color min-w-0 flex-1 truncate text-left text-[24px] font-normal leading-[1.1em]">
          Finalizar pedido
        </h1>
      </header>

      <div
        ref={scrollContainerRef}
        className="app-scroll-y no-scrollbar flex min-h-0 flex-1 flex-col"
      >
        <main className="mx-auto w-full max-w-[480px] space-y-6 px-4 py-4 pb-[calc(12rem+env(safe-area-inset-bottom))] md:max-w-5xl md:px-6 lg:px-8">
          {datosPrevios ? (
            <div className="rounded-xl border border-brand-accent-soft bg-brand-accent-soft px-4 py-3">
              <p className="mb-2 text-sm text-[var(--text-primary)]">¿Querés usar los datos de tu último pedido?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-brand-secondary rounded-lg px-3 py-1.5 text-xs font-semibold"
                  onClick={() => {
                    setNombre(datosPrevios.nombre || "");
                    setTelefono(datosPrevios.telefono || "");
                    setEmail(datosPrevios.email || "");
                    setCalle(datosPrevios.calle || "");
                    setNumeroAltura(datosPrevios.numeroAltura || "");
                    setEntreCalles(datosPrevios.entreCalles || "");
                    setEdificioCasa(datosPrevios.edificioCasa || "");
                    setPisoDepto(datosPrevios.pisoDepto || "");
                    setDatosPrevios(null);
                  }}
                >
                  Usar
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-neutral-50"
                  onClick={() => setDatosPrevios(null)}
                >
                  Ignorar
                </button>
              </div>
            </div>
          ) : null}

          {!isOpen && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-amber-900">
                El local está cerrado. No se pueden enviar pedidos en este momento.
              </p>
            </div>
          )}

          <CustomerSection
            nombre={nombre}
            setNombre={setNombre}
            telefono={telefono}
            setTelefono={setTelefono}
            email={email}
            setEmail={setEmail}
            fieldErrors={fieldErrors}
            clearFieldError={clearFieldError}
          />

          <DeliverySection
            tipoEntrega={tipoEntrega}
            TIPOS_ENTREGA={TIPOS_ENTREGA}
            setTipoEntrega={setTipoEntrega}
            total={checkoutTotal}
            clearDeliveryErrorsForRetiro={() =>
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.calle;
                delete next.numeroAltura;
                delete next.entreCalles;
                delete next.obsEntrega;
                return next;
              })
            }
            calle={calle}
            setCalle={setCalle}
            numeroAltura={numeroAltura}
            setNumeroAltura={setNumeroAltura}
            entreCalles={entreCalles}
            setEntreCalles={setEntreCalles}
            edificioCasa={edificioCasa}
            setEdificioCasa={setEdificioCasa}
            pisoDepto={pisoDepto}
            setPisoDepto={setPisoDepto}
            obsEntrega={obsEntrega}
            setObsEntrega={setObsEntrega}
            fieldErrors={fieldErrors}
            clearFieldError={clearFieldError}
          />

          <ScheduleSection
            tipoDemora={tipoDemora}
            TIPOS_DEMORA={TIPOS_DEMORA}
            setTipoDemora={setTipoDemora}
            setHoraProgramada={setHoraProgramada}
            horaProgramada={horaProgramada}
            fieldErrors={fieldErrors}
            clearFieldError={clearFieldError}
          />

          <PaymentSection
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            montoEfectivo={montoEfectivo}
            setMontoEfectivo={setMontoEfectivo}
            fieldErrors={fieldErrors}
            clearFieldError={clearFieldError}
            montoEfectivoInputRef={montoEfectivoInputRef}
          />

          <CouponSection
            items={items}
            appliedCoupon={appliedCoupon}
            pricingQuote={pricingQuote}
            onApply={(coupon) => {
              setAppliedCoupon({
                codigo: coupon.codigo,
                montoDescuento: coupon.montoDescuento,
              });
              setPricingQuote({
                totalFinal: coupon.totalFinal,
                montoDescuento: coupon.montoDescuento,
                subtotalBruto: coupon.subtotalBruto,
              });
            }}
            onClear={() => {
              setAppliedCoupon(null);
              setPricingQuote(null);
            }}
          />
        </main>
      </div>

      <OrderSummaryFooter
        resumenOpen={resumenOpen}
        setResumenOpen={setResumenOpen}
        resumenItems={resumenItems}
        hasInvalidItems={hasInvalidItems}
        total={checkoutTotal}
        subtotalBruto={pricingQuote?.subtotalBruto}
        montoDescuento={pricingQuote?.montoDescuento ?? 0}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isOpen={isOpen}
        isEnvio={isEnvio}
      />
    </div>
  );
}

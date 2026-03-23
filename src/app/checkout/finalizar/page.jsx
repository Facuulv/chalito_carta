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
import OrderSummaryFooter from "@/components/checkout/finalizar/OrderSummaryFooter";
import { useCheckoutSubmit } from "@/hooks/checkout/useCheckoutSubmit";

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
  const clearCart = useCarritoStore((s) => s.clearCart);
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
  const [edificioCasa, setEdificioCasa] = useState("");
  const [pisoDepto, setPisoDepto] = useState("");
  const [obsEntrega, setObsEntrega] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [tipoDemora, setTipoDemora] = useState(TIPOS_DEMORA.cuantoAntes);
  const [horaProgramada, setHoraProgramada] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [resumenOpen, setResumenOpen] = useState(false);
  const montoEfectivoInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const prevMetodoPagoRef = useRef(metodoPago);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
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

  // Toast si carrito vacío al entrar a finalizar (no al limpiar tras éxito)
  useEffect(() => {
    if (items.length === 0 && !pedidoCreado) {
      toast.error("Tu carrito está vacío.");
    }
  }, [items.length, pedidoCreado]);

  // Migración: limpiar keys legacy una vez inicializado el estado
  useEffect(() => {
    try {
      sessionStorage.removeItem("checkout_direccion");
      sessionStorage.removeItem("checkout_address");
    } catch (_) {}
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
  const handleSubmit = useCheckoutSubmit({
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
    formValues: {
      nombre,
      telefono,
      email,
      tipoEntrega,
      tipoDemora,
      horarioProgramado: horaProgramada,
      calle,
      numeroAltura,
      edificioCasa,
      pisoDepto,
      obsEntrega,
      metodoPago,
      montoEfectivo,
    },
  });

  if (pedidoCreado) {
    return (
      <div className="min-h-[calc(100vh-3rem)] w-full bg-neutral-100 px-4 py-6">
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-8 text-center">
          <p className="text-lg font-bold text-green-800">Pedido enviado</p>
          <p className="mt-1 text-sm text-green-700">Número #{pedidoCreado.id}</p>
          <p className="mt-0.5 text-sm text-green-700">Estado: {pedidoCreado.estado}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-3rem)] w-full bg-neutral-100 px-4 py-6">
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
    );
  }

  return (
    <div
      className="flex h-[calc(100dvh-3.25rem)] min-h-0 w-full flex-col overflow-hidden bg-white"
      style={{
        fontFamily: 'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
      }}
    >
      <header className="sticky top-0 z-40 flex shrink-0 min-h-[68px] items-center gap-3 border-b border-neutral-200 bg-slate-200 px-4 py-5 shadow-sm">
        <Link
          href="/checkout"
          className="flex shrink-0 items-center justify-center header-title-color"
          aria-label="Volver al checkout"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
        <h1 className="font-anton header-title-color min-w-0 flex-1 truncate text-left text-[22px] font-normal leading-[1.1em]">
          Finalizar pedido
        </h1>
      </header>

      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
      >
        <main className="space-y-6 px-4 py-4 pb-44">
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
            clearDeliveryErrorsForRetiro={() =>
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.calle;
                delete next.numeroAltura;
                delete next.obsEntrega;
                return next;
              })
            }
            calle={calle}
            setCalle={setCalle}
            numeroAltura={numeroAltura}
            setNumeroAltura={setNumeroAltura}
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
        </main>
      </div>

      <OrderSummaryFooter
        resumenOpen={resumenOpen}
        setResumenOpen={setResumenOpen}
        resumenItems={resumenItems}
        hasInvalidItems={hasInvalidItems}
        total={total}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isOpen={isOpen}
      />
    </div>
  );
}

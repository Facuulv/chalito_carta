"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCarritoStore } from "@/store/useCarritoStore";
import WhatsAppPedidoButton from "@/components/checkout/WhatsAppPedidoButton";

function CheckoutConfirmadoContent() {
  const searchParams = useSearchParams();
  const pedidoId = (searchParams.get("pedido_id") ?? "").trim();
  const clearCart = useCarritoStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  if (!pedidoId) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
        <div className="app-scroll-y flex min-h-0 flex-1 flex-col px-4 py-6">
          <div className="mx-auto w-full max-w-[480px] rounded-xl border border-neutral-200 bg-white px-4 py-8 text-center md:max-w-3xl">
            <p className="text-sm text-slate-600">
              No encontramos el número de pedido. Volvé al inicio e intentá nuevamente.
            </p>
            <Link
              href="/"
              className="btn-brand-secondary mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-semibold"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      <header className="sticky top-0 z-40 flex shrink-0 min-h-[68px] items-center gap-3 border-b border-neutral-200 bg-slate-200 px-4 py-5 shadow-sm md:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center header-title-color"
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
        <h1 className="font-anton header-title-color min-w-0 flex-1 truncate text-left text-[20px] font-normal leading-[1.1em]">
          Pedido confirmado
        </h1>
      </header>

      <div className="app-scroll-y no-scrollbar flex min-h-0 flex-1 flex-col">
        <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4 py-6 md:max-w-5xl md:px-6 lg:px-8">
          <section className="rounded-xl border border-green-200 bg-green-50 px-4 py-8 text-center">
            <p className="text-lg font-bold text-green-800">Pedido enviado</p>
            <p className="mt-1 text-sm text-green-700">Número #{pedidoId}</p>
            <p className="mt-2 text-sm text-green-700">
              Tu pedido ya quedó registrado. Si WhatsApp está disponible, vas a poder enviar el resumen al local.
            </p>
            <WhatsAppPedidoButton pedidoId={pedidoId} autoOpen />
          </section>

          <Link
            href="/"
            className="btn-brand-secondary mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-semibold"
          >
            Volver al inicio
          </Link>
        </main>
      </div>
    </div>
  );
}

export default function CheckoutConfirmadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
          <div className="flex flex-1 min-h-0 items-center justify-center px-4">
            <p className="text-sm text-slate-500">Cargando...</p>
          </div>
        </div>
      }
    >
      <CheckoutConfirmadoContent />
    </Suspense>
  );
}

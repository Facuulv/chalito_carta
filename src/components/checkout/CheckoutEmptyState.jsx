"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export default function CheckoutEmptyState() {
  return (
    <div className="flex h-[calc(100dvh-3.25rem)] min-h-0 w-full flex-col overflow-hidden bg-white">
      <header className="sticky top-0 z-40 flex shrink-0 min-h-[68px] items-center gap-3 border-b border-neutral-200 bg-slate-200 px-4 py-5 shadow-sm">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center header-title-color"
          aria-label="Volver"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
        <h1 className="font-anton header-title-color min-w-0 flex-1 truncate text-left text-[22px] font-normal leading-[1.1em]">
          Mi pedido
        </h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div
          className="flex min-h-[40vh] w-full max-w-md flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-sm ring-1 ring-neutral-200"
          style={{
            fontFamily:
              'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
          }}
        >
          <ShoppingCart className="h-10 w-10 text-neutral-400" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Tu carrito está vacío
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Agregá productos desde la carta para continuar con tu pedido.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "#21243d" }}
          >
            Ir a la carta
          </Link>
        </div>
      </div>
    </div>
  );
}

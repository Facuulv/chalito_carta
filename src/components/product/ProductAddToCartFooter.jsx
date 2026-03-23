"use client";

import { Minus, Plus } from "lucide-react";
import { formatPrice } from "@/utils/format/price";

export default function ProductAddToCartFooter({
  isSimpleFooter,
  presentacionCantidades,
  setPresentacionCantidad,
  isOpen,
  handleAddToCart,
  precioUnitario,
}) {
  return (
    <footer className="font-mini-footer fixed bottom-0 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-center gap-3 bg-[#fff] px-4 py-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {isSimpleFooter ? (
        <>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => setPresentacionCantidad("simple", -1)}
              disabled={presentacionCantidades.simple <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff7c7c] text-white disabled:opacity-50"
              aria-label="Menos"
            >
              <Minus size={18} strokeWidth={2.5} />
            </button>
            <span className="min-w-[2.5rem] text-center text-xl font-bold text-[#21243d]">
              {presentacionCantidades.simple}
            </span>
            <button
              type="button"
              onClick={() => setPresentacionCantidad("simple", 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff7c7c] text-white"
              aria-label="Más"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
          <button
            type="button"
            disabled={presentacionCantidades.simple === 0 || !isOpen}
            className={`flex flex-1 min-w-0 items-center rounded-md px-4 py-3 transition ${
              isOpen ? "justify-between" : "justify-center"
            } ${
              presentacionCantidades.simple === 0 || !isOpen
                ? "cursor-not-allowed bg-[#ffd082] text-[#21243d] opacity-60"
                : "bg-[#ffd082] text-[#21243d] hover:bg-[#f0c870] active:opacity-90"
            }`}
            onClick={handleAddToCart}
          >
            <span className="text-base font-semibold leading-none">
              {isOpen ? "Agregar" : "Estamos cerrados"}
            </span>
            {isOpen && (
              <span className="whitespace-nowrap text-[1.4em] font-black leading-none tracking-tight">
                {formatPrice(precioUnitario)}
              </span>
            )}
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={
            presentacionCantidades.simple +
              presentacionCantidades.doble +
              presentacionCantidades.triple ===
              0 || !isOpen
          }
          className={`flex w-[90%] items-center rounded-md px-4 py-3 transition ${
            isOpen ? "justify-between" : "justify-center"
          } ${
            presentacionCantidades.simple +
              presentacionCantidades.doble +
              presentacionCantidades.triple ===
              0 || !isOpen
              ? "cursor-not-allowed bg-[#ffd082] text-[#21243d] opacity-60"
              : "bg-[#ffd082] text-[#21243d] hover:bg-[#f0c870] active:opacity-90"
          }`}
          onClick={handleAddToCart}
        >
          <span className="text-base font-semibold leading-none">
            {isOpen ? "Agregar" : "Estamos cerrados"}
          </span>
          {isOpen && (
            <span className="whitespace-nowrap text-[1.4em] font-black leading-none tracking-tight">
              {formatPrice(precioUnitario)}
            </span>
          )}
        </button>
      )}
    </footer>
  );
}

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
  const qtyBtnClass =
    "btn-brand-qty flex h-9 w-9 items-center justify-center rounded-lg disabled:opacity-50";
  const ctaBaseClass =
    "btn-brand-secondary flex min-w-0 items-center rounded-md px-4 py-3 transition";
  const ctaDisabledClass = "cursor-not-allowed opacity-60";

  return (
    <footer className="font-mini-footer fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-center gap-3 bg-[#fff] px-4 py-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:max-w-5xl">
        {isSimpleFooter ? (
        <>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => setPresentacionCantidad("simple", -1)}
              disabled={presentacionCantidades.simple <= 1}
              className={qtyBtnClass}
              aria-label="Menos"
            >
              <Minus size={18} strokeWidth={2.5} />
            </button>
            <span className="min-w-[2.5rem] text-center text-xl font-bold text-primary">
              {presentacionCantidades.simple}
            </span>
            <button
              type="button"
              onClick={() => setPresentacionCantidad("simple", 1)}
              className={qtyBtnClass}
              aria-label="Más"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
          <button
            type="button"
            disabled={presentacionCantidades.simple === 0 || !isOpen}
            className={`${ctaBaseClass} flex-1 ${
              isOpen ? "justify-between" : "justify-center"
            } ${
              presentacionCantidades.simple === 0 || !isOpen ? ctaDisabledClass : ""
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
              presentacionCantidades.triple +
              presentacionCantidades.cuadruple ===
              0 || !isOpen
          }
          className={`${ctaBaseClass} w-[90%] ${
            isOpen ? "justify-between" : "justify-center"
          } ${
            presentacionCantidades.simple +
              presentacionCantidades.doble +
              presentacionCantidades.triple +
              presentacionCantidades.cuadruple ===
              0 || !isOpen
              ? ctaDisabledClass
              : ""
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
      </div>
    </footer>
  );
}

"use client";

import { formatPrice } from "@/utils/format/price";

export default function CheckoutFooter({ isOpen, total, onConfirm }) {
  return (
    <footer className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2">
      <div className="w-full border-t border-neutral-200/60 bg-white/95 px-3 pt-2 pb-3 backdrop-blur">
        {!isOpen && (
          <p className="mb-2 text-center text-sm font-medium text-amber-700">
            El local está cerrado. No se pueden enviar pedidos en este momento.
          </p>
        )}
        <div className="mb-0 flex items-center justify-between px-3">
          <span
            style={{
              fontFamily:
                'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
              fontSize: "14px",
              fontWeight: 600,
              color: "#21243d",
            }}
          >
            Total:
          </span>
          <strong
            style={{
              fontFamily:
                'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
              fontSize: "1.4em",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              color: "#21243d",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            {formatPrice(total)}
          </strong>
        </div>

        <div className="flex justify-center px-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isOpen}
            className={`w-full transition text-[#21243d] ${
              isOpen
                ? "hover:opacity-90 hover:text-slate-600"
                : "cursor-not-allowed opacity-50"
            }`}
            style={{
              fontFamily:
                'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
              fontWeight: 700,
              lineHeight: 1,
              fontSize: "16px",
              height: "45px",
              padding: "0 .9em",
              borderRadius: "4px",
              background: "#88e1f2",
            }}
          >
            Confirmar pedido
          </button>
        </div>
      </div>
    </footer>
  );
}

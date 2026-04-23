"use client";

import { ChevronDown } from "lucide-react";
import { formatPrice } from "@/utils/format/price";

export default function OrderSummaryFooter({
  resumenOpen,
  setResumenOpen,
  resumenItems,
  hasInvalidItems,
  total,
  handleSubmit,
  isSubmitting,
  isOpen,
  isEnvio,
}) {
  return (
    <footer className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2">
      <div className="w-full border-t border-neutral-200/60 bg-white/95 backdrop-blur">
        <section className="overflow-hidden border-b border-neutral-200/60 bg-[#f8f8f8]">
          <button
            type="button"
            onClick={() => setResumenOpen((o) => !o)}
            className="relative flex w-full items-center justify-center px-4 py-3"
          >
            <span className="text-sm font-semibold uppercase text-slate-800">
              Resumen del pedido
            </span>
            <span
              className={`absolute right-4 inline-block transition-transform duration-500 ease-out ${
                resumenOpen ? "-rotate-180" : "rotate-0"
              }`}
            >
              <ChevronDown size={20} className="text-slate-600" />
            </span>
          </button>
          <div
            className="relative overflow-hidden transition-[height] duration-500 ease-out"
            style={{ height: resumenOpen ? "220px" : "0" }}
          >
            <div className="absolute inset-0 no-scrollbar overflow-y-auto overflow-x-hidden border-t border-neutral-200/70 bg-white/50 px-4 py-3">
              <div className="divide-y divide-neutral-200/50">
                {resumenItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-2 py-2.5 text-sm">
                    <div>
                      <p className="text-slate-700">
                        {item.cantidad} x {item.nombre}
                      </p>
                      {item.extras.length > 0 && (
                        <ul className="mt-0.5 space-y-0.5 text-xs text-slate-600">
                          {item.extras.map((e) => (
                            <li key={e.id}>
                              + {e.nombre} {formatPrice(e.precioExtra ?? e.precio ?? 0)}
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.observaciones && (
                        <p className="mt-0.5 text-xs italic text-slate-600">
                          Obs: {item.observaciones}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 font-semibold text-slate-900">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div className="px-3 pt-2 pb-3">
          {hasInvalidItems && (
            <p className="mb-1 text-center text-sm font-medium text-amber-700">
              Hay un producto inválido. Vaciá el carrito y agregalo nuevamente.
            </p>
          )}
          {isEnvio && (
            <p className="mb-2 rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-center text-xs font-semibold text-amber-900">
              El envio se cobra aparte y no esta incluido en este total.
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
              onClick={handleSubmit}
              disabled={hasInvalidItems || isSubmitting || !isOpen}
              className={`w-full transition text-[#21243d] hover:opacity-90 hover:text-slate-600 ${
                hasInvalidItems || isSubmitting || !isOpen
                  ? "cursor-not-allowed opacity-50 hover:opacity-50 hover:text-[#21243d]"
                  : ""
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
              {isSubmitting ? "Enviando..." : "Enviar pedido"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

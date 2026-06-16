"use client";

import { ChevronDown, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/utils/format/price";
import { CANTIDAD_EXTRA_MAX } from "@/utils/cart/checkoutDisplay";

export default function PersonalizationSection({
  extrasOpen,
  setExtrasOpen,
  extras,
  extrasCantidades,
  toggleExtra,
  incrementarExtra,
  decrementarExtra,
  categoriaPapas,
  isPapas,
  papasOpen,
  setPapasOpen,
  papasProductos,
  papasSeleccionadas,
  setPapasCantidad,
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-slate-800">
        Personalizá tu selección
      </h2>

      <div className="overflow-hidden rounded-md border border-neutral-200 bg-[#f5f5f5]">
        <div>
          <button
            type="button"
            onClick={() => setExtrasOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 pt-3 pb-1 text-left"
          >
            <span className="text-sm font-semibold uppercase text-slate-800">
              Extras
            </span>
            <span
              className={`inline-block transition-transform duration-200 ease-out ${
                extrasOpen ? "-rotate-180" : "rotate-0"
              }`}
            >
              <ChevronDown size={20} className="text-slate-600" />
            </span>
          </button>
          <p className="px-4 pb-3 text-sm text-slate-500">
            Seleccioná las opciones que quieras.
          </p>
          {extrasOpen && extras.length > 0 && (
            <div className="space-y-0 border-t border-neutral-200 bg-white/50 px-4 py-2">
              {extras.map((extra) => {
                const qty = extrasCantidades[extra.id] ?? 0;
                const checked = qty > 0;
                const permiteCantidad = Boolean(extra.permiteCantidad);
                const precioUnit = extra.precio ?? extra.precioExtra ?? 0;
                const precioMostrado =
                  permiteCantidad && checked ? precioUnit * qty : precioUnit;

                return (
                  <div
                    key={extra.id}
                    className="flex items-center justify-between gap-2 py-2"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExtra(extra)}
                        className="h-4 w-4 shrink-0 accent-[var(--brand-primary)]"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {extra.nombre}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {permiteCantidad && checked && (
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => decrementarExtra(extra.id)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-slate-700"
                            aria-label={`Menos ${extra.nombre}`}
                          >
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                          <span className="min-w-[1.5rem] shrink-0 text-center text-sm font-medium text-slate-800">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementarExtra(extra.id)}
                            disabled={qty >= CANTIDAD_EXTRA_MAX}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
                            aria-label={`Más ${extra.nombre}`}
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      )}
                      <span className="min-w-[4.5rem] shrink-0 text-right text-sm font-semibold tabular-nums text-slate-800">
                        + {formatPrice(precioMostrado)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {extrasOpen && extras.length === 0 && (
            <div className="border-t border-neutral-200 px-4 py-3 text-sm text-slate-500">
              No hay extras para este producto.
            </div>
          )}
        </div>

        {categoriaPapas && !isPapas && (
          <>
            <div className="mx-4 border-t border-neutral-300" />
            <div>
              <button
                type="button"
                onClick={() => setPapasOpen((o) => !o)}
                className="flex w-full items-center justify-between px-4 pt-3 pb-1 text-left"
              >
                <span className="text-sm font-semibold uppercase text-slate-800">
                  Papas fritas
                </span>
                <span
                  className={`inline-block transition-transform duration-200 ease-out ${
                    papasOpen ? "-rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown size={20} className="text-slate-600" />
                </span>
              </button>
              <p className="px-4 pb-3 text-sm text-slate-500">
                Solo porción de papas clásicas. Otras variedades están en la categoría Papas.
              </p>
              {papasOpen && (
                <div className="space-y-0 border-t border-neutral-200 bg-white/50 px-4 py-2">
                  {papasProductos.length === 0 ? (
                    <p className="py-2 text-sm text-slate-500">
                      No hay porciones clásicas disponibles.
                    </p>
                  ) : (
                    papasProductos.map((p) => {
                      const papasQty = papasSeleccionadas[p.id] ?? 0;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 py-2"
                        >
                          <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                            {p.nombre}
                          </span>
                          <div className="flex shrink-0 items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => setPapasCantidad(p.id, -1)}
                              disabled={papasQty <= 0}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
                            >
                              <Minus size={14} strokeWidth={2.5} />
                            </button>
                            <span className="min-w-[1.5rem] shrink-0 text-center text-sm font-medium text-slate-800">
                              {papasQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPapasCantidad(p.id, 1)}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-slate-700"
                            >
                              <Plus size={14} strokeWidth={2.5} />
                            </button>
                            <span className="min-w-[4.5rem] shrink-0 text-right text-sm font-semibold tabular-nums text-slate-800">
                              {formatPrice(p.precio)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

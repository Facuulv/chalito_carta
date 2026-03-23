"use client";

import { ChevronDown, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/utils/format/price";

export default function PersonalizationSection({
  extrasOpen,
  setExtrasOpen,
  extras,
  extrasSeleccionados,
  toggleExtra,
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
                const checked = extrasSeleccionados.includes(extra.id);
                return (
                  <label
                    key={extra.id}
                    className="flex cursor-pointer items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExtra(extra.id)}
                        className="h-4 w-4 accent-slate-900"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {extra.nombre}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      + {formatPrice(extra.precio ?? extra.precioExtra ?? 0)}
                    </span>
                  </label>
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
                Seleccioná las opciones que quieras.
              </p>
              {papasOpen && (
                <div className="space-y-0 border-t border-neutral-200 bg-white/50 px-4 py-2">
                  {papasProductos.length === 0 ? (
                    <p className="py-2 text-sm text-slate-500">Cargando...</p>
                  ) : (
                    papasProductos.map((p) => {
                      const qty = papasSeleccionadas[p.id] ?? 0;
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
                              disabled={qty <= 0}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
                            >
                              <Minus size={14} strokeWidth={2.5} />
                            </button>
                            <span className="min-w-[1.5rem] shrink-0 text-center text-sm font-medium text-slate-800">
                              {qty}
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

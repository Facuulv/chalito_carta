"use client";

import { Minus, Plus } from "lucide-react";
import { formatPrice } from "@/utils/format/price";

function PresentationRow({
  checked,
  onToggle,
  label,
  quantity,
  onDecrement,
  onIncrement,
  decrementDisabled,
  price,
  ariaLabel,
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm px-3 py-1.5 transition bg-[#fff]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="h-4 w-4 shrink-0 accent-slate-900"
          aria-label={ariaLabel}
        />
        <span className="presentation-option">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onDecrement}
          disabled={decrementDisabled}
          className="flex h-8 w-8 items-center justify-center rounded bg-[#ff7c7c] text-white disabled:opacity-50"
          aria-label="Menos"
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <span className="min-w-[1.5rem] text-center text-sm font-medium text-slate-800">
          {quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex h-8 w-8 items-center justify-center rounded bg-[#ff7c7c] text-white"
          aria-label="Más"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
      <span className="min-w-[4rem] shrink-0 text-right text-sm font-semibold text-slate-800">
        {formatPrice(price)}
      </span>
    </div>
  );
}

export default function PresentationSelector({
  isSandwiches,
  productoNombre,
  presentacionCantidades,
  presentacion,
  precioSimple,
  precioDoble,
  precioTriple,
  togglePresentacionCheck,
  setPresentacionCantidad,
}) {
  return (
    <section className="[&_.presentation-option]:font-mini-footer [&_.presentation-option]:uppercase">
      <h2
        className={`text-lg font-semibold leading-tight text-slate-800 ${
          isSandwiches ? "mb-3" : "mb-0"
        }`}
      >
        {isSandwiches ? "Presentación" : "Presentaciones"}
      </h2>
      {!isSandwiches && (
        <p className="-mt-0.5 mb-3 text-[13px] leading-tight text-slate-500">
          Seleccioná las opciones que quieras.
        </p>
      )}
      <div className="space-y-0">
        <div className="flex items-center justify-between gap-3 rounded-sm px-3 py-1.5 transition bg-[#fff]">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <input
              type="checkbox"
              checked={presentacionCantidades.simple > 0}
              onChange={() => togglePresentacionCheck("simple")}
              className="h-4 w-4 shrink-0 accent-slate-900"
              aria-label={
                isSandwiches
                  ? `Seleccionar ${productoNombre}`
                  : "Seleccionar Simple"
              }
            />
            <span className={isSandwiches ? "" : "presentation-option"}>
              {isSandwiches ? `Sándwich de ${productoNombre}` : "Simple"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setPresentacionCantidad("simple", -1)}
              disabled={presentacionCantidades.simple <= 0}
              className="flex h-8 w-8 items-center justify-center rounded bg-[#ff7c7c] text-white disabled:opacity-50"
              aria-label="Menos"
            >
              <Minus size={16} strokeWidth={2.5} />
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-medium text-slate-800">
              {presentacionCantidades.simple}
            </span>
            <button
              type="button"
              onClick={() => setPresentacionCantidad("simple", 1)}
              className="flex h-8 w-8 items-center justify-center rounded bg-[#ff7c7c] text-white"
              aria-label="Más"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
          <span className="min-w-[4rem] shrink-0 text-right text-sm font-semibold text-slate-800">
            {formatPrice(precioSimple)}
          </span>
        </div>

        {presentacion.doble && (
          <PresentationRow
            checked={presentacionCantidades.doble > 0}
            onToggle={() => togglePresentacionCheck("doble")}
            label="Doble"
            quantity={presentacionCantidades.doble}
            onDecrement={() => setPresentacionCantidad("doble", -1)}
            onIncrement={() => setPresentacionCantidad("doble", 1)}
            decrementDisabled={presentacionCantidades.doble <= 0}
            price={precioDoble}
            ariaLabel="Seleccionar Doble"
          />
        )}

        {presentacion.triple && (
          <PresentationRow
            checked={presentacionCantidades.triple > 0}
            onToggle={() => togglePresentacionCheck("triple")}
            label="Triple"
            quantity={presentacionCantidades.triple}
            onDecrement={() => setPresentacionCantidad("triple", -1)}
            onIncrement={() => setPresentacionCantidad("triple", 1)}
            decrementDisabled={presentacionCantidades.triple <= 0}
            price={precioTriple}
            ariaLabel="Seleccionar Triple"
          />
        )}
      </div>
    </section>
  );
}

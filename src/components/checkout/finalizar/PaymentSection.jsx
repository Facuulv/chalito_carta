"use client";

import { useEffect } from "react";

// TEMPORAL: contingencia del servidor. Para reactivar Mercado Pago, pasar a false.
const MERCADO_PAGO_TEMPORARILY_DISABLED = true;

export default function PaymentSection({
  metodoPago,
  setMetodoPago,
  montoEfectivo,
  setMontoEfectivo,
  fieldErrors,
  clearFieldError,
  montoEfectivoInputRef,
}) {
  useEffect(() => {
    if (MERCADO_PAGO_TEMPORARILY_DISABLED && metodoPago === "mercadopago") {
      setMetodoPago("efectivo");
    }
  }, [metodoPago, setMetodoPago]);

  return (
    <section id="checkout-metodoPago" className="space-y-3">
      <h2 className="-mx-4 w-[calc(100%+2rem)] rounded-none border border-neutral-200 bg-[#f8f8f8] px-3 py-1.5 text-center text-sm font-semibold text-slate-800">
        Forma de pago
      </h2>

      <div className="space-y-3">
        {fieldErrors.metodoPago && (
          <p className="text-xs text-red-600">{fieldErrors.metodoPago}</p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { id: "efectivo", label: "Efectivo" },
            { id: "transferencia", label: "Transferencia" },
            { id: "mercadopago", label: "MercadoPago" },
          ].map((metodo) => {
            const isMercadoPagoDisabled =
              MERCADO_PAGO_TEMPORARILY_DISABLED && metodo.id === "mercadopago";
            const selected = !isMercadoPagoDisabled && metodoPago === metodo.id;
            return (
              <button
                key={metodo.id}
                type="button"
                disabled={isMercadoPagoDisabled}
                aria-disabled={isMercadoPagoDisabled}
                onClick={() => {
                  if (isMercadoPagoDisabled) return;
                  setMetodoPago(metodo.id);
                  clearFieldError("metodoPago");
                }}
                className="cursor-pointer list-none m-0 flex flex-col items-center justify-center gap-[3px] rounded-[5px] text-center transition hover:opacity-90 disabled:cursor-not-allowed disabled:hover:opacity-100"
                style={{
                  cursor: isMercadoPagoDisabled ? "not-allowed" : "pointer",
                  position: "relative",
                  listStyle: "none",
                  width: "110px",
                  fontSize: "14px",
                  minHeight: "55px",
                  textAlign: "center",
                  display: "flex",
                  margin: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  gap: "3px",
                  border: isMercadoPagoDisabled
                    ? "2px solid #d4d4d4"
                    : "2px solid var(--brand-primary)",
                  padding: ".6em .7em",
                  fontWeight: selected ? 900 : 600,
                  lineHeight: 1.2,
                  borderRadius: "5px",
                  boxShadow: "1px 2px 5px rgba(0,0,0,0.2)",
                  backgroundColor: selected ? "var(--brand-primary)" : "#fff",
                  color: isMercadoPagoDisabled
                    ? "#9ca3af"
                    : selected
                      ? "#fff"
                      : "var(--text-primary)",
                  opacity: isMercadoPagoDisabled ? 0.55 : 1,
                }}
              >
                {metodo.label}
              </button>
            );
          })}
        </div>

        {MERCADO_PAGO_TEMPORARILY_DISABLED && (
          <p className="text-center text-xs text-slate-600">
            Mercado Pago no está disponible temporalmente. Podés abonar en efectivo o transferencia.
          </p>
        )}

        {metodoPago === "efectivo" && (
          <label className="block">
            <span className="mb-1 block text-sm text-primary" style={{ fontWeight: 700 }}>
              ¿Con cuánto vas a pagar?
            </span>
            <input
              ref={montoEfectivoInputRef}
              id="checkout-montoEfectivo"
              type="text"
              inputMode="numeric"
              value={montoEfectivo}
              onChange={(e) => {
                const raw = e.target.value;
                // Solo caracteres válidos para monto: dígitos, punto y coma
                const cleaned = raw.replace(/[^0-9.,]/g, "");
                setMontoEfectivo(cleaned);
                clearFieldError("montoEfectivo");
              }}
              placeholder="Ingresá el monto"
              className={`h-11 w-full rounded-sm border-0 bg-[#f8f8f8] px-3 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none focus:ring-1 ${
                fieldErrors.montoEfectivo
                  ? "ring-2 ring-red-500 focus:ring-red-500"
                  : "focus:ring-neutral-300/40"
              }`}
            />
            {fieldErrors.montoEfectivo && (
              <p className="mt-0.5 text-xs text-red-600">{fieldErrors.montoEfectivo}</p>
            )}
          </label>
        )}
      </div>
    </section>
  );
}

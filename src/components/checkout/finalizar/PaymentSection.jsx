"use client";

export default function PaymentSection({
  metodoPago,
  setMetodoPago,
  montoEfectivo,
  setMontoEfectivo,
  fieldErrors,
  clearFieldError,
  montoEfectivoInputRef,
}) {
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
            const selected = metodoPago === metodo.id;
            return (
              <button
                key={metodo.id}
                type="button"
                onClick={() => {
                  setMetodoPago(metodo.id);
                  clearFieldError("metodoPago");
                }}
                className="cursor-pointer list-none m-0 flex flex-col items-center justify-center gap-[3px] rounded-[5px] text-center transition hover:opacity-90"
                style={{
                  cursor: "pointer",
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
                  border: "2px solid #21243d",
                  padding: ".6em .7em",
                  fontWeight: selected ? 900 : 600,
                  lineHeight: 1.2,
                  borderRadius: "5px",
                  boxShadow: "1px 2px 5px #0003",
                  backgroundColor: selected ? "#21243d" : "#fff",
                  color: selected ? "#fff" : "#21243d",
                }}
              >
                {metodo.label}
              </button>
            );
          })}
        </div>

        {metodoPago === "efectivo" && (
          <label className="block">
            <span className="mb-1 block text-sm" style={{ color: "#21243d", fontWeight: 700 }}>
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

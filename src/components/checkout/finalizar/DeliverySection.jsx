"use client";

export default function DeliverySection({
  tipoEntrega,
  TIPOS_ENTREGA,
  setTipoEntrega,
  clearDeliveryErrorsForRetiro,
  calle,
  setCalle,
  numeroAltura,
  setNumeroAltura,
  edificioCasa,
  setEdificioCasa,
  pisoDepto,
  setPisoDepto,
  obsEntrega,
  setObsEntrega,
  fieldErrors,
  clearFieldError,
}) {
  return (
    <section className="space-y-3">
      <h2 className="-mx-4 w-[calc(100%+2rem)] rounded-none border border-neutral-200 bg-[#f8f8f8] px-3 py-1.5 text-center text-sm font-semibold text-slate-800">
        Tipo de entrega
      </h2>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setTipoEntrega(TIPOS_ENTREGA.envio)}
          className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
            tipoEntrega === TIPOS_ENTREGA.envio
              ? "bg-[#21243d] text-white"
              : "text-slate-700 hover:bg-neutral-100"
          }`}
        >
          🏠 Envío a domicilio
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoEntrega(TIPOS_ENTREGA.retiro);
            clearDeliveryErrorsForRetiro();
          }}
          className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
            tipoEntrega === TIPOS_ENTREGA.retiro
              ? "bg-[#21243d] text-white"
              : "text-slate-700 hover:bg-neutral-100"
          }`}
        >
          🏪 Retiro en el local
        </button>
      </div>

      {tipoEntrega === TIPOS_ENTREGA.envio && (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm" style={{ color: "#21243d", fontWeight: 700 }}>
              Calle
            </span>
            <input
              id="checkout-calle"
              type="text"
              value={calle}
              onChange={(e) => {
                const raw = e.target.value;
                // Letras (con tildes/ñ), números, espacios, punto y guion
                const cleaned = raw.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.\-]+/g, "");
                setCalle(cleaned);
                clearFieldError("calle");
              }}
              placeholder="Ej: Av. Corrientes"
              className={`h-11 w-full rounded-sm border-0 bg-[#f8f8f8] px-3 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none focus:ring-1 ${
                fieldErrors.calle
                  ? "ring-2 ring-red-500 focus:ring-red-500"
                  : "focus:ring-neutral-300/40"
              }`}
            />
            {fieldErrors.calle && (
              <p className="mt-0.5 text-xs text-red-600">{fieldErrors.calle}</p>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm" style={{ color: "#21243d", fontWeight: 700 }}>
              Número / Altura
            </span>
            <input
              id="checkout-numeroAltura"
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={numeroAltura}
              onChange={(e) => {
                const raw = e.target.value;
                // Solo dígitos para número/altura
                const digitsOnly = raw.replace(/\D/g, "");
                setNumeroAltura(digitsOnly);
                clearFieldError("numeroAltura");
              }}
              placeholder="Ej: 1234"
              className={`h-11 w-full rounded-sm border-0 bg-[#f8f8f8] px-3 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none focus:ring-1 ${
                fieldErrors.numeroAltura
                  ? "ring-2 ring-red-500 focus:ring-red-500"
                  : "focus:ring-neutral-300/40"
              }`}
            />
            {fieldErrors.numeroAltura && (
              <p className="mt-0.5 text-xs text-red-600">{fieldErrors.numeroAltura}</p>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm" style={{ color: "#21243d", fontWeight: 700 }}>
              Edificio / Casa (opcional)
            </span>
            <input
              type="text"
              value={edificioCasa}
              onChange={(e) => setEdificioCasa(e.target.value)}
              placeholder="Ej: Torre A"
              className="h-11 w-full rounded-sm border-0 bg-[#f8f8f8] px-3 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none focus:ring-1 focus:ring-neutral-300/40"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm" style={{ color: "#21243d", fontWeight: 700 }}>
              Piso / Depto (opcional)
            </span>
            <input
              type="text"
              value={pisoDepto}
              onChange={(e) => setPisoDepto(e.target.value)}
              placeholder="Ej: 5B"
              className="h-11 w-full rounded-sm border-0 bg-[#f8f8f8] px-3 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none focus:ring-1 focus:ring-neutral-300/40"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-sm" style={{ color: "#21243d", fontWeight: 700 }}>
                Observaciones (envío)
              </span>
              <span className="shrink-0 text-xs text-slate-500">{obsEntrega.length}/150</span>
            </div>
            <textarea
              id="checkout-obsEntrega"
              value={obsEntrega}
              onChange={(e) => {
                setObsEntrega(e.target.value);
                clearFieldError("obsEntrega");
              }}
              maxLength={150}
              rows={4}
              placeholder="Ej: timbre roto, portón azul"
              className={`w-full resize-none rounded-sm border-0 bg-[#f8f8f8] px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400/60 outline-none focus:ring-1 ${
                fieldErrors.obsEntrega
                  ? "ring-2 ring-red-500 focus:ring-red-500"
                  : "focus:ring-neutral-300/40"
              }`}
            />
            {fieldErrors.obsEntrega && (
              <p className="mt-0.5 text-xs text-red-600">{fieldErrors.obsEntrega}</p>
            )}
          </label>
        </div>
      )}
    </section>
  );
}

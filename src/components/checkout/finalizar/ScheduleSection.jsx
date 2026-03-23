"use client";

export default function ScheduleSection({
  tipoDemora,
  TIPOS_DEMORA,
  setTipoDemora,
  setHoraProgramada,
  horaProgramada,
  fieldErrors,
  clearFieldError,
}) {
  return (
    <section className="space-y-3">
      <h2 className="-mx-4 w-[calc(100%+2rem)] rounded-none border border-neutral-200 bg-[#f8f8f8] px-3 py-1.5 text-center text-sm font-semibold text-slate-800">
        ¿Cuándo lo querés?
      </h2>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-200 bg-white p-1">
        <button
          type="button"
          onClick={() => {
            setTipoDemora(TIPOS_DEMORA.cuantoAntes);
            setHoraProgramada("");
            clearFieldError("horarioProgramado");
          }}
          className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
            tipoDemora === TIPOS_DEMORA.cuantoAntes
              ? "bg-[#21243d] text-white"
              : "text-slate-700 hover:bg-neutral-100"
          }`}
        >
          Cuanto antes
        </button>
        <button
          type="button"
          onClick={() => setTipoDemora(TIPOS_DEMORA.programado)}
          className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
            tipoDemora === TIPOS_DEMORA.programado
              ? "bg-[#21243d] text-white"
              : "text-slate-700 hover:bg-neutral-100"
          }`}
        >
          Hora programada
        </button>
      </div>

      {tipoDemora === TIPOS_DEMORA.programado && (
        <label className="block">
          <span className="mb-1 block text-sm" style={{ color: "#21243d", fontWeight: 700 }}>
            ¿Para qué hora?
          </span>
          <input
            id="checkout-horarioProgramado"
            type="time"
            value={horaProgramada}
            onChange={(e) => {
              setHoraProgramada(e.target.value);
              clearFieldError("horarioProgramado");
            }}
            className={`h-11 w-full rounded-sm border-0 bg-[#f8f8f8] px-3 text-sm text-slate-800 outline-none focus:ring-1 ${
              fieldErrors.horarioProgramado
                ? "ring-2 ring-red-500 focus:ring-red-500"
                : "focus:ring-neutral-300/40"
            }`}
          />
          {fieldErrors.horarioProgramado && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.horarioProgramado}</p>
          )}
        </label>
      )}
    </section>
  );
}

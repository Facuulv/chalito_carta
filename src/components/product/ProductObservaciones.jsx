"use client";

export default function ProductObservaciones({ observaciones, setObservaciones }) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800">Observaciones</h2>
        <span className="shrink-0 text-xs text-slate-500">
          {observaciones.length}/150
        </span>
      </div>
      <textarea
        value={observaciones}
        onChange={(event) => setObservaciones(event.target.value)}
        maxLength={150}
        rows={4}
        placeholder="Ej: sin cebolla, bien cocido, etc."
        className="w-full resize-none rounded-md border border-neutral-200 bg-[#f5f5f5] p-3 text-sm text-slate-700 outline-none focus:border-neutral-400 focus:ring-[0.5px] focus:ring-neutral-400"
      />
    </section>
  );
}

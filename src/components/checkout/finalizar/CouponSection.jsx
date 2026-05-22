"use client";

import { useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { formatPrice } from "@/utils/format/price";
import {
  mapCartItemsToCouponPayload,
  validarCupon,
} from "@/services/cuponesService";

export default function CouponSection({
  items,
  appliedCoupon,
  pricingQuote,
  onApply,
  onClear,
}) {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    const trimmed = codigo.trim();
    if (!trimmed) {
      setError("Ingresá un código");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payloadItems = mapCartItemsToCouponPayload(items);
      const quote = await validarCupon({
        couponCode: trimmed,
        items: payloadItems,
      });
      onApply({
        codigo: quote.codigo || trimmed.toUpperCase(),
        montoDescuento: quote.montoDescuento,
        subtotalBruto: quote.subtotalBruto,
        totalFinal: quote.totalFinal,
      });
      setCodigo("");
    } catch (err) {
      setError(err.message || "Cupón no válido");
      onClear?.();
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCodigo("");
    setError("");
    onClear?.();
  };

  return (
    <section className="rounded-xl border border-neutral-200 bg-white px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <Tag size={18} className="text-violet-700" />
        <h2 className="text-base font-semibold text-slate-800">Cupón de descuento</h2>
      </div>

      {appliedCoupon ? (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-green-800">
              {appliedCoupon.codigo} aplicado
            </p>
            <p className="text-xs text-green-700">
              Descuento: {formatPrice(appliedCoupon.montoDescuento)}
            </p>
            {pricingQuote?.totalFinal != null && (
              <p className="text-xs text-green-700 mt-0.5">
                Total con descuento: {formatPrice(pricingQuote.totalFinal)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 rounded p-1 text-green-800 hover:bg-green-100"
            aria-label="Quitar cupón"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="Código"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm uppercase"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="shrink-0 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Aplicar"
            )}
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : null}
    </section>
  );
}

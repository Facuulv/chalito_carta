"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { getItemSubtotal } from "@/store/useCarritoStore";
import { buildImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";
import { getItemName, getItemQuantity } from "@/utils/cart/cartItem";
import {
  isHamburguesas,
  splitExtrasForHamburguesa,
} from "@/utils/cart/checkoutDisplay";
import { PLACEHOLDER_PRODUCT_CARD_IMG } from "@/constants/images";

export default function CheckoutItemCard({
  item,
  onAskDelete,
  onUpdateQuantity,
}) {
  const quantity = getItemQuantity(item);
  const subtotal = getItemSubtotal(item);
  const imgUrl = buildImageUrl(item.imagen_url) || PLACEHOLDER_PRODUCT_CARD_IMG;
  const rawExtras = (item.extrasSeleccionados ?? item.extras ?? []).filter(
    (e) => typeof e === "object" && e != null && "nombre" in e
  );
  const observaciones = (item.observaciones ?? "").trim();
  const isHamb = isHamburguesas(item.categoria_nombre);
  const { presentacion, otros } = isHamb
    ? splitExtrasForHamburguesa(rawExtras)
    : { presentacion: [], otros: rawExtras };
  const hasPresentacion = presentacion.length > 0;
  const hasExtras = otros.length > 0;
  const hasObs = !!observaciones;

  return (
    <div
      className="rounded-lg bg-white"
      style={{ boxShadow: "0 7px 30px -10px #96aab480" }}
    >
      <article className="relative flex items-stretch gap-3 pl-0 pr-3 pt-3 pb-3">
        <div className="flex w-[5.5rem] shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt={getItemName(item)}
            className="h-[5.5rem] w-[5.5rem] object-cover"
            onError={(e) => {
              e.target.src = PLACEHOLDER_PRODUCT_CARD_IMG;
            }}
          />
        </div>
        <div
          className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-neutral-300/50"
          aria-hidden
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="min-w-0 truncate uppercase"
              style={{
                color: "#21243d",
                fontWeight: 600,
                lineHeight: "1.2em",
                fontSize: "14px",
                textOverflow: "ellipsis",
                fontFamily:
                  'var(--font-lato), Lato, "sans-serif", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              {getItemName(item)}
            </h3>
            <button
              type="button"
              onClick={() => onAskDelete(item)}
              className="shrink-0 rounded p-1.5 text-slate-400 transition hover:text-red-600 active:text-red-600"
              aria-label={`Eliminar ${getItemName(item)}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {(hasPresentacion || hasExtras || hasObs) && (
            <div
              className="-mt-2.5 uppercase text-slate-500"
              style={{
                fontFamily:
                  'var(--font-lato), Lato, "sans-serif", Roboto, Helvetica, Arial, sans-serif',
                fontWeight: 300,
                lineHeight: "1.1em",
                fontSize: "12px",
                whiteSpace: "pre-wrap",
              }}
            >
              {hasPresentacion && (
                <p className="text-slate-600">
                  {"   └─ "}
                  {presentacion.join(", ")}
                </p>
              )}
              {hasExtras && (
                <p className={hasPresentacion ? "mt-2" : ""}>
                  -<strong className="font-extrabold text-slate-900">EXTRAS:</strong>{" "}
                  {otros.map((e) => e.nombre).join(", ")}.
                </p>
              )}
              {hasObs && (
                <p className={hasPresentacion || hasExtras ? "mt-2" : ""}>
                  -<strong className="font-extrabold text-slate-900">OBS:</strong>{" "}
                  {observaciones}
                </p>
              )}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="inline-flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                className="flex h-6 w-6 items-center justify-center rounded bg-[#ff7c7c] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Menos"
                disabled={quantity <= 1}
              >
                <Minus size={10} strokeWidth={2.5} />
              </button>
              <span
                className="min-w-[1.75rem] text-center text-base font-bold text-slate-800"
                style={{
                  fontFamily:
                    'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
                }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                className="flex h-6 w-6 items-center justify-center rounded bg-[#ff7c7c] text-white"
                aria-label="Más"
              >
                <Plus size={10} strokeWidth={2.5} />
              </button>
            </div>
            <span
              className="shrink-0 text-slate-900"
              style={{
                fontWeight: 900,
                whiteSpace: "nowrap",
                fontSize: "18px",
                fontFamily:
                  'var(--font-lato), Lato, "sans-serif", Roboto, Helvetica, Arial, sans-serif',
                lineHeight: 1.5,
              }}
            >
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}

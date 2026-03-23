"use client";

import { TriangleAlert } from "lucide-react";

export default function StoreClosedBanner({ message, nextOpeningText }) {
  return (
    <div className="-mt-2 w-full border-t border-amber-300/90 bg-amber-100 pt-5 pb-3">
      <div className="flex items-start gap-3 px-4" style={{ fontFamily: 'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif' }}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/80">
          <TriangleAlert size={18} className="text-amber-700" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-amber-900">{message}</h3>
          <p className="mt-0.5 text-sm text-amber-800/90">
            Podés ver la carta, pero no hacer pedidos en este momento.
          </p>
          {nextOpeningText && (
            <p className="mt-1.5 text-sm font-medium text-amber-900">
              {nextOpeningText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

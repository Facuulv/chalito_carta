"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { obtenerWhatsAppClientePedido } from "@/services/checkoutWhatsAppService";

/**
 * Botón para enviar el pedido al local por WhatsApp.
 * Intenta abrir WhatsApp una vez si está activo, pero el botón siempre queda visible.
 * Si falla la carga o el flag está off, no muestra nada (el pedido ya fue creado).
 */
export default function WhatsAppPedidoButton({ pedidoId, autoOpen = true }) {
  const [waData, setWaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const autoOpenAttemptedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const id = Number(pedidoId);
    if (!Number.isFinite(id) || id <= 0) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    obtenerWhatsAppClientePedido(id)
      .then((data) => {
        if (!cancelled) {
          setWaData(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWaData(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pedidoId]);

  useEffect(() => {
    if (!autoOpen || !waData?.activo || !waData?.urlWaMe) return;
    if (autoOpenAttemptedRef.current) return;
    autoOpenAttemptedRef.current = true;

    try {
      window.open(waData.urlWaMe, "_blank", "noopener,noreferrer");
    } catch (_) {
      /* El botón sigue disponible como fallback */
    }
  }, [autoOpen, waData]);

  const handleClick = useCallback(() => {
    if (!waData?.urlWaMe) return;
    window.open(waData.urlWaMe, "_blank", "noopener,noreferrer");
  }, [waData]);

  if (loading || !waData?.activo || !waData?.urlWaMe) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-green-700">
        Podés enviar el resumen de tu pedido al local por WhatsApp.
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
      >
        <FaWhatsapp className="text-lg" aria-hidden />
        Enviar pedido por WhatsApp
      </button>
    </div>
  );
}

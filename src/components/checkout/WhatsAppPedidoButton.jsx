"use client";

import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { obtenerWhatsAppClientePedido } from "@/services/checkoutWhatsAppService";
import {
  markWhatsAppAutoOpened,
  shouldAutoOpenWhatsApp,
} from "@/utils/checkout/whatsappAutoOpenGuard";

const AUTO_OPEN_DELAY_MS = 1200;

export default function WhatsAppPedidoButton({ pedidoId, autoOpen = true }) {
  const [waData, setWaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const autoOpenAttemptedRef = useRef(false);
  const autoOpenTimerRef = useRef(null);

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
    if (!shouldAutoOpenWhatsApp(pedidoId)) return;

    autoOpenAttemptedRef.current = true;
    markWhatsAppAutoOpened(pedidoId);

    autoOpenTimerRef.current = window.setTimeout(() => {
      window.location.href = waData.urlWaMe;
    }, AUTO_OPEN_DELAY_MS);

    return () => {
      if (autoOpenTimerRef.current) {
        window.clearTimeout(autoOpenTimerRef.current);
        autoOpenTimerRef.current = null;
      }
    };
  }, [autoOpen, waData, pedidoId]);

  if (loading || !waData?.activo || !waData?.urlWaMe) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-green-700">
        {autoOpen
          ? "Abrimos WhatsApp con tu pedido listo para enviar. Si no se abrió, tocá el botón de abajo."
          : "Podés enviar el resumen de tu pedido al local por WhatsApp."}
      </p>

      <a
        href={waData.urlWaMe}
        rel="noopener noreferrer"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
      >
        <FaWhatsapp className="text-lg" aria-hidden />
        Enviar pedido por WhatsApp
      </a>
    </div>
  );
}

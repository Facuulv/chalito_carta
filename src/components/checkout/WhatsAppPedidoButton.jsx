"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { LoaderCircle, RefreshCcw } from "lucide-react";
import { obtenerWhatsAppClientePedido } from "@/services/checkoutWhatsAppService";
import {
  markWhatsAppAutoOpened,
  resolveWhatsAppClienteMessage,
  shouldAutoOpenWhatsApp,
} from "@/utils/checkout/whatsappAutoOpenGuard";

const AUTO_OPEN_DELAY_MS = 1200;
const PAGO_PENDIENTE_POLL_MS = 2000;
const PAGO_PENDIENTE_MAX_ATTEMPTS = 15;

const UI = {
  loading: "loading",
  ready: "ready",
  inactive: "inactive",
  pendingPayment: "pending_payment",
  error: "error",
};

export default function WhatsAppPedidoButton({ pedidoId, autoOpen = true }) {
  const [uiState, setUiState] = useState(UI.loading);
  const [waData, setWaData] = useState(null);
  const [motivo, setMotivo] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const autoOpenAttemptedRef = useRef(false);
  const autoOpenTimerRef = useRef(null);
  const pollAttemptsRef = useRef(0);
  const pollTimerRef = useRef(null);
  const abortRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (autoOpenTimerRef.current) {
      window.clearTimeout(autoOpenTimerRef.current);
      autoOpenTimerRef.current = null;
    }
    if (pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const applyResult = useCallback((data) => {
    if (data?.activo && data?.urlWaMe) {
      setWaData(data);
      setMotivo(null);
      setErrorMessage(null);
      setUiState(UI.ready);
      return UI.ready;
    }

    const nextMotivo = data?.motivo || "feature_desactivada";
    setWaData(null);
    setMotivo(nextMotivo);
    setErrorMessage(null);

    if (nextMotivo === "pago_pendiente") {
      setUiState(UI.pendingPayment);
      return UI.pendingPayment;
    }

    setUiState(UI.inactive);
    return UI.inactive;
  }, []);

  const fetchLink = useCallback(
    async ({ allowPendingPoll = true } = {}) => {
      const id = Number(pedidoId);
      if (!Number.isFinite(id) || id <= 0) {
        setUiState(UI.inactive);
        setMotivo("pedido_no_encontrado");
        return;
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setUiState((prev) => (prev === UI.ready ? prev : UI.loading));
      setErrorMessage(null);

      try {
        const data = await obtenerWhatsAppClientePedido(id, {
          signal: controller.signal,
        });
        const next = applyResult(data);

        if (next === UI.pendingPayment && allowPendingPoll) {
          if (pollAttemptsRef.current < PAGO_PENDIENTE_MAX_ATTEMPTS) {
            pollAttemptsRef.current += 1;
            pollTimerRef.current = window.setTimeout(() => {
              fetchLink({ allowPendingPoll: true });
            }, PAGO_PENDIENTE_POLL_MS);
          }
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        setWaData(null);
        setMotivo(error?.motivo || error?.code || "error_servidor");
        setErrorMessage(error?.message || resolveWhatsAppClienteMessage("error_servidor"));
        setUiState(UI.error);
      }
    },
    [applyResult, pedidoId]
  );

  useEffect(() => {
    pollAttemptsRef.current = 0;
    autoOpenAttemptedRef.current = false;
    clearTimers();
    fetchLink({ allowPendingPoll: true });
    return () => {
      clearTimers();
    };
  }, [pedidoId, fetchLink, clearTimers]);

  useEffect(() => {
    if (!autoOpen || uiState !== UI.ready || !waData?.urlWaMe) return;
    if (autoOpenAttemptedRef.current) return;
    if (!shouldAutoOpenWhatsApp(pedidoId)) return;

    autoOpenAttemptedRef.current = true;

    autoOpenTimerRef.current = window.setTimeout(() => {
      markWhatsAppAutoOpened(pedidoId);
      window.location.href = waData.urlWaMe;
    }, AUTO_OPEN_DELAY_MS);

    return () => {
      if (autoOpenTimerRef.current) {
        window.clearTimeout(autoOpenTimerRef.current);
        autoOpenTimerRef.current = null;
      }
    };
  }, [autoOpen, uiState, waData, pedidoId]);

  if (uiState === UI.loading) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-slate-600">
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        Preparando enlace de WhatsApp…
      </div>
    );
  }

  if (uiState === UI.ready && waData?.urlWaMe) {
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

  if (uiState === UI.pendingPayment) {
    return (
      <div className="mt-4 space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p>{resolveWhatsAppClienteMessage("pago_pendiente")}</p>
        <p className="text-xs text-amber-700">
          Intentos de confirmación: {pollAttemptsRef.current}/{PAGO_PENDIENTE_MAX_ATTEMPTS}
        </p>
        <button
          type="button"
          onClick={() => {
            pollAttemptsRef.current = 0;
            fetchLink({ allowPendingPoll: true });
          }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden />
          Consultar de nuevo
        </button>
      </div>
    );
  }

  if (uiState === UI.error) {
    return (
      <div className="mt-4 space-y-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <p>{errorMessage || resolveWhatsAppClienteMessage(motivo)}</p>
        <button
          type="button"
          onClick={() => {
            pollAttemptsRef.current = 0;
            fetchLink({ allowPendingPoll: true });
          }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 text-sm font-semibold text-red-800 transition hover:bg-red-100"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-slate-700">
      <p>{resolveWhatsAppClienteMessage(motivo)}</p>
    </div>
  );
}

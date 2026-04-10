"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CircleAlert, CircleCheckBig, CircleX, LoaderCircle, RefreshCcw } from "lucide-react";
import { obtenerEstadoPagoPedido } from "@/services/pedidosPublicosService";
import { formatPrice } from "@/utils/format/price";
import { resetClientStateAfterApprovedPayment } from "@/utils/checkout/resetAfterApprovedPayment";

const POLL_INTERVAL_MS = 3500;
const MAX_POLL_ATTEMPTS = 5;

const UI_STATES = {
  loading: "loading",
  approved: "approved",
  pending: "pending",
  rejected: "rejected",
  cancelled: "cancelled",
  error: "error",
};

function resolveUiState(estadoPago) {
  const normalized = String(estadoPago ?? "").trim().toUpperCase();
  if (normalized === "PAGADO") return UI_STATES.approved;
  if (normalized === "PENDIENTE") return UI_STATES.pending;
  if (normalized === "RECHAZADO") return UI_STATES.rejected;
  if (normalized === "CANCELADO") return UI_STATES.cancelled;
  return UI_STATES.error;
}

function buildStatusContent(uiState, pollAttempt) {
  switch (uiState) {
    case UI_STATES.approved:
      return {
        title: "Pago aprobado",
        message: "Recibimos tu pago correctamente. Ya estamos preparando tu pedido.",
      };
    case UI_STATES.pending:
      return {
        title: "Pago pendiente",
        message:
          pollAttempt >= MAX_POLL_ATTEMPTS
            ? "Tu pago sigue pendiente. Te recomendamos revisar nuevamente en unos minutos."
            : "Estamos confirmando tu pago con Mercado Pago. Esta pantalla se actualizará automáticamente.",
      };
    case UI_STATES.rejected:
      return {
        title: "Pago rechazado",
        message: "No se pudo aprobar el pago. Podés intentar nuevamente con otro medio.",
      };
    case UI_STATES.cancelled:
      return {
        title: "Pago cancelado",
        message: "El proceso de pago fue cancelado. Si querés, podés volver a intentarlo.",
      };
    case UI_STATES.loading:
      return {
        title: "Verificando pago...",
        message: "Estamos consultando el estado real de tu pago y pedido.",
      };
    default:
      return {
        title: "No pudimos verificar tu pago",
        message: "Ocurrió un problema al consultar el estado. Intentá nuevamente.",
      };
  }
}

function getStatusIcon(uiState) {
  if (uiState === UI_STATES.loading || uiState === UI_STATES.pending) {
    return <LoaderCircle size={28} className="animate-spin text-amber-600" />;
  }
  if (uiState === UI_STATES.approved) {
    return <CircleCheckBig size={28} className="text-green-600" />;
  }
  if (uiState === UI_STATES.rejected || uiState === UI_STATES.cancelled) {
    return <CircleX size={28} className="text-red-600" />;
  }
  return <CircleAlert size={28} className="text-amber-700" />;
}

function parseEstadoPayload(response) {
  const root = response?.data ?? response ?? {};
  const pedido = root?.pedido ?? {};
  const pago = root?.pago ?? {};

  return {
    pedidoId: root?.pedido_id ?? root?.pedidoId ?? pedido?.id ?? null,
    estadoPago:
      root?.estado_pago ??
      root?.estadoPago ??
      root?.payment_status ??
      pago?.estado ??
      pago?.estado_pago ??
      null,
    estadoPedido: root?.estado_pedido ?? root?.estadoPedido ?? pedido?.estado ?? null,
    total: root?.total ?? pedido?.total ?? null,
    moneda: root?.moneda ?? pedido?.moneda ?? "ARS",
  };
}

function CheckoutResultadoContent() {
  const searchParams = useSearchParams();
  const pedidoIdFromUrl = (searchParams.get("pedido_id") ?? "").trim();
  const [uiState, setUiState] = useState(UI_STATES.loading);
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [pollAttempt, setPollAttempt] = useState(0);
  const pollTimeoutRef = useRef(null);
  const postPagoLimpiezaHechaRef = useRef(false);
  const fetchStatusRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      window.clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(
    async ({ attempt = 0, withLoading = true } = {}) => {
      if (!pedidoIdFromUrl) {
        stopPolling();
        setUiState(UI_STATES.error);
        setErrorMessage("No encontramos `pedido_id` en la URL de retorno.");
        setData(null);
        return;
      }

      if (withLoading) {
        setUiState(UI_STATES.loading);
      }
      setErrorMessage("");

      try {
        const response = await obtenerEstadoPagoPedido(pedidoIdFromUrl);
        const parsed = parseEstadoPayload(response);
        const nextUiState = resolveUiState(parsed.estadoPago);
        setData(parsed);
        setUiState(nextUiState);
        setPollAttempt(attempt);

        if (nextUiState === UI_STATES.approved && !postPagoLimpiezaHechaRef.current) {
          postPagoLimpiezaHechaRef.current = true;
          resetClientStateAfterApprovedPayment();
        }

        if (nextUiState === UI_STATES.pending && attempt < MAX_POLL_ATTEMPTS) {
          stopPolling();
          pollTimeoutRef.current = window.setTimeout(() => {
            fetchStatusRef.current?.({ attempt: attempt + 1, withLoading: false });
          }, POLL_INTERVAL_MS);
          return;
        }

        stopPolling();
      } catch (error) {
        stopPolling();
        setUiState(UI_STATES.error);
        setErrorMessage(
          error?.message ?? "No pudimos consultar el estado del pago. Intentá nuevamente."
        );
      }
    },
    [pedidoIdFromUrl, stopPolling]
  );

  useEffect(() => {
    fetchStatusRef.current = fetchStatus;
  }, [fetchStatus]);

  useEffect(() => {
    postPagoLimpiezaHechaRef.current = false;
  }, [pedidoIdFromUrl]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void fetchStatus({ attempt: 0, withLoading: true });
    });
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [pedidoIdFromUrl, fetchStatus, stopPolling]);

  const statusContent = buildStatusContent(uiState, pollAttempt);
  const hasTotal = Number.isFinite(Number(data?.total));
  const showRetry = uiState === UI_STATES.error;
  const showPollingHint = uiState === UI_STATES.pending && pollAttempt < MAX_POLL_ATTEMPTS;
  const displayPedidoId = data?.pedidoId ?? pedidoIdFromUrl;

  return (
    <div
      className="flex h-[calc(100dvh-3.25rem)] min-h-0 w-full flex-col overflow-hidden bg-white"
      style={{
        fontFamily: 'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
      }}
    >
      <header className="sticky top-0 z-40 flex shrink-0 min-h-[68px] items-center gap-3 border-b border-neutral-200 bg-slate-200 px-4 py-5 shadow-sm">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center header-title-color"
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
        <h1 className="font-anton header-title-color min-w-0 flex-1 truncate text-left text-[22px] font-normal leading-[1.1em]">
          Resultado del pago
        </h1>
      </header>

      <main className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {getStatusIcon(uiState)}
            <h2 className="text-lg font-bold text-slate-900">{statusContent.title}</h2>
          </div>

          <p className="mt-2 text-sm text-slate-700">{statusContent.message}</p>

          {showPollingHint && (
            <p className="mt-2 text-xs text-slate-500">
              Reintento {pollAttempt + 1} de {MAX_POLL_ATTEMPTS + 1}.
            </p>
          )}

          {uiState === UI_STATES.error && errorMessage && (
            <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
          )}
        </section>

        <section className="mt-4 rounded-xl border border-neutral-200 bg-[#f8f8f8] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Pedido</span>
            <strong className="text-slate-900">#{displayPedidoId || "-"}</strong>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Estado del pedido</span>
            <strong className="text-slate-900">{data?.estadoPedido ?? "-"}</strong>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Total</span>
            <strong className="text-slate-900">
              {hasTotal ? formatPrice(Number(data.total)) : "-"}
              {hasTotal && data?.moneda ? ` ${data.moneda}` : ""}
            </strong>
          </div>
        </section>

        <div className="mt-5 flex gap-3">
          {showRetry && (
            <button
              type="button"
              onClick={() => fetchStatus({ attempt: 0, withLoading: true })}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              Reintentar
            </button>
          )}
          <Link
            href="/"
            className="flex h-11 flex-1 items-center justify-center rounded-md bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutResultadoPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex h-[calc(100dvh-3.25rem)] items-center justify-center bg-white"
          style={{
            fontFamily: 'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
          }}
        >
          <p className="text-sm text-slate-500">Cargando...</p>
        </div>
      }
    >
      <CheckoutResultadoContent />
    </Suspense>
  );
}

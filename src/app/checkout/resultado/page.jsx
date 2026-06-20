"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheckBig,
  CircleX,
  LoaderCircle,
  RefreshCcw,
} from "lucide-react";
import {
  obtenerEstadoPagoPedido,
  obtenerEstadoSesionMp,
  reconciliarSesionMp,
} from "@/services/pedidosPublicosService";
import { formatPrice } from "@/utils/format/price";
import { resetClientStateAfterApprovedPayment } from "@/utils/checkout/resetAfterApprovedPayment";
import WhatsAppPedidoButton from "@/components/checkout/WhatsAppPedidoButton";

const POLL_INTERVAL_MS = 3500;
const MAX_POLL_ATTEMPTS = 5;
const MAX_POLL_ATTEMPTS_SESSION = 24;

const UI_STATES = {
  loading: "loading",
  approved: "approved",
  pending: "pending",
  rejected: "rejected",
  cancelled: "cancelled",
  error: "error",
};

const DISPLAY_CONTEXT = {
  loading: "loading",
  approved: "approved",
  confirming: "confirming",
  abandoned: "abandoned",
  cancelled: "cancelled",
  rejected: "rejected",
  unconfirmed: "unconfirmed",
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

function hasMpPaymentActivity(parsed) {
  const mp = String(parsed?.estadoMp ?? "").trim().toLowerCase();
  return mp !== "" && mp !== "null";
}

function isAbandonedCheckout(resultadoMp, parsed) {
  if (parsed?.pedidoId) return false;
  if (hasMpPaymentActivity(parsed)) return false;
  if (resultadoMp === "failure") return true;
  if (resultadoMp === "pending") return true;
  return false;
}

function shouldIntentarReconciliacion(resultadoMp, parsed) {
  if (!parsed) return false;
  if (parsed.pedidoId) return false;
  if (resultadoMp === "success") return true;
  const estadoSesion = String(parsed?.estadoSesion ?? "").trim().toUpperCase();
  const estadoPago = String(parsed?.estadoPago ?? "").trim().toUpperCase();
  if (estadoSesion === "CANCELADO" && estadoPago !== "PAGADO") return true;
  if (estadoPago === "RECHAZADO" && hasMpPaymentActivity(parsed)) return true;
  return false;
}

function shouldPollPending(resultadoMp, parsed, attempt, maxAttempts) {
  if (attempt >= maxAttempts) return false;
  if (isAbandonedCheckout(resultadoMp, parsed)) return false;
  if (resultadoMp === "failure") return false;
  if (resultadoMp === "success" || resultadoMp === "") return true;
  if (hasMpPaymentActivity(parsed)) return true;
  return false;
}

function resolveDisplayContext(uiState, resultadoMp, parsed, pollAttempt, maxPollAttempts) {
  if (uiState === UI_STATES.loading) return DISPLAY_CONTEXT.loading;
  if (uiState === UI_STATES.approved) return DISPLAY_CONTEXT.approved;
  if (uiState === UI_STATES.rejected) return DISPLAY_CONTEXT.rejected;
  if (uiState === UI_STATES.cancelled) return DISPLAY_CONTEXT.cancelled;
  if (uiState === UI_STATES.error) return DISPLAY_CONTEXT.error;
  if (isAbandonedCheckout(resultadoMp, parsed)) return DISPLAY_CONTEXT.abandoned;
  if (resultadoMp === "failure") return DISPLAY_CONTEXT.cancelled;
  if (uiState === UI_STATES.pending && pollAttempt >= maxPollAttempts && !parsed?.pedidoId) {
    return DISPLAY_CONTEXT.unconfirmed;
  }
  if (uiState === UI_STATES.pending) return DISPLAY_CONTEXT.confirming;
  return DISPLAY_CONTEXT.error;
}

function buildStatusContent(displayContext) {
  switch (displayContext) {
    case DISPLAY_CONTEXT.approved:
      return {
        title: "Pago aprobado",
        message:
          "Recibimos tu pago correctamente. Ya estamos preparando tu pedido.",
      };
    case DISPLAY_CONTEXT.confirming:
      return {
        title: "Confirmando tu pago",
        message:
          "Estamos verificando el pago con Mercado Pago. Esta pantalla se actualizará sola en unos segundos.",
      };
    case DISPLAY_CONTEXT.abandoned:
      return {
        title: "Pago no completado",
        message:
          "Saliste del checkout de Mercado Pago sin finalizar el pago. Tu pedido no fue enviado al local.",
      };
    case DISPLAY_CONTEXT.cancelled:
      return {
        title: "Pago cancelado",
        message:
          "El pago no se completó. Podés volver a intentarlo cuando quieras.",
      };
    case DISPLAY_CONTEXT.rejected:
      return {
        title: "Pago rechazado",
        message:
          "Mercado Pago no pudo aprobar el pago. Probá de nuevo u otro medio de pago.",
      };
    case DISPLAY_CONTEXT.unconfirmed:
      return {
        title: "Pago sin confirmar",
        message:
          "Todavía no recibimos la confirmación. Si ya pagaste, esperá unos minutos. Si no, podés intentar de nuevo.",
      };
    case DISPLAY_CONTEXT.loading:
      return {
        title: "Verificando pago",
        message: "Consultamos el estado de tu pago…",
      };
    default:
      return {
        title: "No pudimos verificar tu pago",
        message: "Ocurrió un problema al consultar el estado. Intentá nuevamente.",
      };
  }
}

function getStatusIcon(displayContext) {
  if (
    displayContext === DISPLAY_CONTEXT.loading ||
    displayContext === DISPLAY_CONTEXT.confirming
  ) {
    return <LoaderCircle size={28} className="animate-spin text-amber-600" />;
  }
  if (displayContext === DISPLAY_CONTEXT.approved) {
    return <CircleCheckBig size={28} className="text-green-600" />;
  }
  if (
    displayContext === DISPLAY_CONTEXT.rejected ||
    displayContext === DISPLAY_CONTEXT.cancelled ||
    displayContext === DISPLAY_CONTEXT.abandoned
  ) {
    return <CircleX size={28} className="text-red-600" />;
  }
  if (displayContext === DISPLAY_CONTEXT.unconfirmed) {
    return <CircleAlert size={28} className="text-amber-700" />;
  }
  return <CircleAlert size={28} className="text-amber-700" />;
}

function parseEstadoPayload(response, source = "pedido") {
  const root = response?.data ?? response ?? {};
  if (source === "session") {
    return {
      pedidoId: root?.pedido_id ?? root?.pedidoId ?? null,
      estadoPago: root?.estado_pago ?? root?.estadoPago ?? null,
      estadoPedido: root?.estado_pedido ?? root?.estadoPedido ?? null,
      total: root?.total ?? null,
      moneda: root?.moneda ?? "ARS",
      estadoSesion: root?.estado_sesion ?? null,
      estadoMp: root?.estado_mp ?? root?.estadoMp ?? null,
    };
  }
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
    estadoSesion: null,
    estadoMp: null,
  };
}

function CheckoutResultadoContent() {
  const searchParams = useSearchParams();
  const sessionIdFromUrl = (searchParams.get("session_id") ?? "").trim();
  const pedidoIdFromUrl = (searchParams.get("pedido_id") ?? "").trim();
  const resultadoMp = (searchParams.get("resultado") ?? "").trim().toLowerCase();
  const useSessionFlow = Boolean(sessionIdFromUrl);
  const maxPollAttempts = useSessionFlow ? MAX_POLL_ATTEMPTS_SESSION : MAX_POLL_ATTEMPTS;
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
    async ({ attempt = 0, withLoading = true, forceReconcile = false } = {}) => {
      if (!useSessionFlow && !pedidoIdFromUrl) {
        stopPolling();
        setUiState(UI_STATES.error);
        setErrorMessage(
          "No encontramos la información del pago en el enlace. Volvé a intentar desde el checkout."
        );
        setData(null);
        return;
      }

      if (withLoading) {
        setUiState(UI_STATES.loading);
      }
      setErrorMessage("");

      try {
        const response = useSessionFlow
          ? await obtenerEstadoSesionMp(sessionIdFromUrl)
          : await obtenerEstadoPagoPedido(pedidoIdFromUrl);
        let parsed = parseEstadoPayload(response, useSessionFlow ? "session" : "pedido");

        if (useSessionFlow && (forceReconcile || shouldIntentarReconciliacion(resultadoMp, parsed))) {
          try {
            const recon = await reconciliarSesionMp(sessionIdFromUrl);
            const estadoReconciliado = recon?.data?.estado;
            if (estadoReconciliado) {
              parsed = parseEstadoPayload({ data: estadoReconciliado }, "session");
            }
          } catch (reconcileError) {
            console.warn("[checkout/resultado] Reconciliación MP:", reconcileError?.message);
          }
        }

        const nextUiState = resolveUiState(parsed.estadoPago);
        setData(parsed);
        setUiState(nextUiState);
        setPollAttempt(attempt);

        if (nextUiState === UI_STATES.approved && !postPagoLimpiezaHechaRef.current) {
          postPagoLimpiezaHechaRef.current = true;
          resetClientStateAfterApprovedPayment();
        }

        if (
          nextUiState === UI_STATES.pending &&
          shouldPollPending(resultadoMp, parsed, attempt, maxPollAttempts)
        ) {
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
    [useSessionFlow, sessionIdFromUrl, pedidoIdFromUrl, maxPollAttempts, resultadoMp, stopPolling]
  );

  useEffect(() => {
    fetchStatusRef.current = fetchStatus;
  }, [fetchStatus]);

  useEffect(() => {
    postPagoLimpiezaHechaRef.current = false;
  }, [pedidoIdFromUrl, sessionIdFromUrl]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void fetchStatus({ attempt: 0, withLoading: true });
    });
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [pedidoIdFromUrl, sessionIdFromUrl, useSessionFlow, fetchStatus, stopPolling]);

  const displayContext = resolveDisplayContext(
    uiState,
    resultadoMp,
    data,
    pollAttempt,
    maxPollAttempts
  );
  const statusContent = buildStatusContent(displayContext);
  const hasTotal = Number.isFinite(Number(data?.total));
  const displayPedidoId = data?.pedidoId ?? (useSessionFlow ? null : pedidoIdFromUrl);
  const showRetryPayment = [
    DISPLAY_CONTEXT.abandoned,
    DISPLAY_CONTEXT.cancelled,
    DISPLAY_CONTEXT.rejected,
    DISPLAY_CONTEXT.unconfirmed,
  ].includes(displayContext);
  const showRefreshStatus = displayContext === DISPLAY_CONTEXT.error;
  const showOrderDetails =
    displayContext === DISPLAY_CONTEXT.approved ||
    displayContext === DISPLAY_CONTEXT.confirming ||
    displayContext === DISPLAY_CONTEXT.unconfirmed ||
    (displayPedidoId != null && displayPedidoId !== "");

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white"
      style={{
        fontFamily:
          'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
      }}
    >
      <header className="sticky top-0 z-40 flex shrink-0 min-h-[68px] items-center gap-3 border-b border-neutral-200 bg-slate-200 px-4 py-5 shadow-sm md:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center header-title-color"
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
        <h1 className="font-anton header-title-color min-w-0 flex-1 truncate text-left text-[20px] font-normal leading-[1.1em]">
          Resultado del pago
        </h1>
      </header>

      <div className="app-scroll-y no-scrollbar flex min-h-0 flex-1 flex-col">
        <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4 py-5 md:max-w-5xl md:px-6 lg:px-8">
          <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {getStatusIcon(displayContext)}
              <h2 className="text-lg font-bold text-slate-900">{statusContent.title}</h2>
            </div>

            <p className="mt-2 text-sm text-slate-700">{statusContent.message}</p>

            {displayContext === DISPLAY_CONTEXT.abandoned && (
              <p className="mt-2 text-sm text-slate-600">
                Tu carrito sigue guardado. Podés volver al checkout para pagar de nuevo.
              </p>
            )}

            {displayContext === DISPLAY_CONTEXT.error && errorMessage && (
              <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}
          </section>

          {(showOrderDetails ||
            (displayContext === DISPLAY_CONTEXT.abandoned && hasTotal)) && (
            <section className="mt-4 rounded-xl border border-neutral-200 bg-[#f8f8f8] p-4">
              {displayPedidoId != null && displayPedidoId !== "" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">Pedido</span>
                  <strong className="text-slate-900">#{displayPedidoId}</strong>
                </div>
              )}
              {data?.estadoPedido && (
                <div
                  className={`flex items-center justify-between text-sm ${
                    displayPedidoId ? "mt-2" : ""
                  }`}
                >
                  <span className="font-semibold text-slate-700">Estado</span>
                  <strong className="text-slate-900">{data.estadoPedido}</strong>
                </div>
              )}
              {hasTotal && (
                <div
                  className={`flex items-center justify-between text-sm ${
                    displayPedidoId || data?.estadoPedido ? "mt-2" : ""
                  }`}
                >
                  <span className="font-semibold text-slate-700">Total</span>
                  <strong className="text-slate-900">
                    {formatPrice(Number(data.total))}
                    {data?.moneda ? ` ${data.moneda}` : ""}
                  </strong>
                </div>
              )}
            </section>
          )}

          {displayContext === DISPLAY_CONTEXT.approved && displayPedidoId != null && (
            <section className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <WhatsAppPedidoButton pedidoId={displayPedidoId} autoOpen />
            </section>
          )}

          <div className="mt-5 flex flex-col gap-3">
            {showRetryPayment && (
              <Link
                href="/checkout/finalizar"
                className="btn-brand-secondary flex h-12 w-full items-center justify-center rounded-xl px-3 text-sm font-semibold"
              >
                Reintentar pago
              </Link>
            )}
            {showRefreshStatus && (
              <button
                type="button"
                onClick={() => fetchStatus({ attempt: 0, withLoading: true, forceReconcile: useSessionFlow })}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                <RefreshCcw size={16} />
                Consultar de nuevo
              </button>
            )}
            <Link
              href="/"
              className={`flex h-12 w-full items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                showRetryPayment || showRefreshStatus
                  ? "border border-neutral-300 bg-white text-[var(--text-primary)] hover:bg-neutral-50"
                  : "btn-brand-secondary"
              }`}
            >
              Volver al inicio
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CheckoutResultadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
          <div
            className="flex flex-1 min-h-0 items-center justify-center px-4"
            style={{
              fontFamily:
                'Lato, "sans-serif", Roboto, RobotoFallback, Helvetica, Arial, sans-serif',
            }}
          >
            <p className="text-sm text-slate-500">Cargando...</p>
          </div>
        </div>
      }
    >
      <CheckoutResultadoContent />
    </Suspense>
  );
}

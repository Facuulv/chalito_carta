/**
 * Estado del canal online desde el backend (fuente de verdad).
 * GET /carta-publica/estado-tienda
 */

const DEFAULT_ESTADO = {
  estaAbierto: true,
  bloqueado: false,
  tiendaOnlineActiva: true,
  validarHorarios: true,
  mensaje: "Estamos abiertos",
  nextOpeningText: null,
  razon: "default",
};

let cachedEstado = { ...DEFAULT_ESTADO };
let lastFetchAt = 0;

export function getCachedEstadoTienda() {
  return { ...cachedEstado };
}

export function canAcceptOnlineOrders() {
  const estado = cachedEstado;
  if (estado.bloqueado) return false;
  if (!estado.validarHorarios) return true;
  return Boolean(estado.estaAbierto);
}

function getApiBaseUrl() {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) return null;
  return base.replace(/\/$/, "");
}

function buildEstadoUrl() {
  const base = getApiBaseUrl();
  if (!base) return null;
  const useApiPrefix = !base.includes("/api");
  const path = useApiPrefix
    ? "/api/carta-publica/estado-tienda"
    : "/carta-publica/estado-tienda";
  return `${base}${path}`;
}

export async function fetchEstadoTienda() {
  const url = buildEstadoUrl();

  if (!url) {
    console.warn("[estadoTienda] NEXT_PUBLIC_API_BASE_URL no configurada, usando estado abierto");
    cachedEstado = { ...DEFAULT_ESTADO };
    lastFetchAt = Date.now();
    return getCachedEstadoTienda();
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data?.success) {
      throw new Error(data?.message || "Respuesta inválida");
    }

    cachedEstado = {
      estaAbierto: Boolean(data.estaAbierto),
      bloqueado: Boolean(data.bloqueado),
      tiendaOnlineActiva: data.tiendaOnlineActiva !== false,
      validarHorarios: data.validarHorarios !== false,
      mensaje: data.mensaje || DEFAULT_ESTADO.mensaje,
      nextOpeningText: data.nextOpeningText ?? null,
      razon: data.razon || "",
    };
    lastFetchAt = Date.now();
    return getCachedEstadoTienda();
  } catch (error) {
    console.warn("[estadoTienda] Error consultando API, fallback abierto:", error.message);
    cachedEstado = { ...DEFAULT_ESTADO };
    lastFetchAt = Date.now();
    return getCachedEstadoTienda();
  }
}

export function mapEstadoToStoreStatus(estado = cachedEstado) {
  if (estado.bloqueado) {
    return {
      isOpen: false,
      message: estado.mensaje || "La tienda no está disponible",
      nextOpeningText: null,
    };
  }

  if (!estado.validarHorarios) {
    return {
      isOpen: true,
      message: "Estamos abiertos",
      nextOpeningText: null,
    };
  }

  if (estado.estaAbierto) {
    return {
      isOpen: true,
      message: estado.mensaje || "Estamos abiertos",
      nextOpeningText: null,
    };
  }

  return {
    isOpen: false,
    message: estado.mensaje || "Estamos cerrados",
    nextOpeningText: estado.nextOpeningText ?? null,
  };
}

export function getLastFetchAt() {
  return lastFetchAt;
}

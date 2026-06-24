const STORAGE_KEY = "chalito_envio_gratis_config";
const CACHE_TTL_MS = 5 * 60 * 1000;

function buildCartaPublicaPath(suffixPath) {
  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL no configurada");
  }
  const normalizedBase = baseURL.replace(/\/$/, "");
  const usesApiPrefix = /\/api$/i.test(normalizedBase);
  const endpointPath = usesApiPrefix
    ? `/carta-publica${suffixPath}`
    : `/api/carta-publica${suffixPath}`;
  return `${normalizedBase}${endpointPath}`;
}

function readCachedConfig() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCachedConfig(data) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })
    );
  } catch {
    /* ignore */
  }
}

/**
 * @returns {Promise<{ activo: boolean, montoMinimo: number }>}
 */
export async function obtenerConfigEnvioGratis() {
  const cached = readCachedConfig();
  if (cached) return cached;

  const url = buildCartaPublicaPath("/config/envio-gratis");
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || "No pudimos cargar la configuración de envío gratis.");
  }

  const data = {
    activo: Boolean(payload?.data?.activo),
    montoMinimo: Number(payload?.data?.montoMinimo) || 0,
  };

  writeCachedConfig(data);
  return data;
}

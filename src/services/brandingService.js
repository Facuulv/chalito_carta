const DEFAULT_BRANDING = {
  nombreNegocio: "El Chalito",
  logoUrl: null,
  colorPrimario: "#0D0D0D",
  colorSecundario: "#EA580C",
  carousel: {
    enabled: true,
    slides: [],
    updatedAt: null,
  },
};

let cachedBranding = { ...DEFAULT_BRANDING, carousel: { ...DEFAULT_BRANDING.carousel } };
let lastFetchAt = 0;
let lastCarouselVersion = null;
const CACHE_MS = 45_000;

function getApiBaseUrl() {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) return null;
  return base.replace(/\/$/, "");
}

function buildBrandingUrl() {
  const base = getApiBaseUrl();
  if (!base) return null;
  const useApiPrefix = !base.includes("/api");
  const path = useApiPrefix ? "/api/carta-publica/branding" : "/carta-publica/branding";
  return `${base}${path}`;
}

function normalizeCarousel(data) {
  const carousel = data?.carousel || {};
  return {
    enabled: carousel.enabled !== false,
    slides: Array.isArray(carousel.slides) ? carousel.slides : [],
    updatedAt: carousel.updatedAt || null,
  };
}

export function getCachedBranding() {
  return {
    ...cachedBranding,
    carousel: {
      ...cachedBranding.carousel,
      slides: [...(cachedBranding.carousel?.slides || [])],
    },
  };
}

export async function fetchBranding({ force = false } = {}) {
  const now = Date.now();
  if (!force && lastFetchAt && now - lastFetchAt < CACHE_MS) {
    return getCachedBranding();
  }

  const url = buildBrandingUrl();
  if (!url) {
    cachedBranding = {
      ...DEFAULT_BRANDING,
      carousel: { ...DEFAULT_BRANDING.carousel },
    };
    lastFetchAt = now;
    return getCachedBranding();
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

    const carousel = normalizeCarousel(data);
    const carouselVersion = carousel.updatedAt || String(carousel.slides.length);

    cachedBranding = {
      nombreNegocio: data.nombreNegocio || DEFAULT_BRANDING.nombreNegocio,
      logoUrl: data.logoUrl || null,
      colorPrimario: data.colorPrimario || DEFAULT_BRANDING.colorPrimario,
      colorSecundario: data.colorSecundario || DEFAULT_BRANDING.colorSecundario,
      carousel,
    };
    lastFetchAt = now;
    lastCarouselVersion = carouselVersion;

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("carta_branding", JSON.stringify(cachedBranding));
      } catch (_) {
        /* noop */
      }
    }

    return getCachedBranding();
  } catch (error) {
    console.warn("[branding] Error consultando API, usando cache/default:", error.message);
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("carta_branding");
        if (stored) {
          const parsed = JSON.parse(stored);
          cachedBranding = {
            ...DEFAULT_BRANDING,
            ...parsed,
            carousel: normalizeCarousel(parsed),
          };
          return getCachedBranding();
        }
      } catch (_) {
        /* noop */
      }
    }
    cachedBranding = {
      ...DEFAULT_BRANDING,
      carousel: { ...DEFAULT_BRANDING.carousel },
    };
    lastFetchAt = now;
    return getCachedBranding();
  }
}

export function getLastCarouselVersion() {
  return lastCarouselVersion;
}

export function applyBrandingCssVars(branding = cachedBranding) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--brand-primary", branding.colorPrimario || DEFAULT_BRANDING.colorPrimario);
  root.style.setProperty(
    "--brand-secondary",
    branding.colorSecundario || DEFAULT_BRANDING.colorSecundario
  );
}

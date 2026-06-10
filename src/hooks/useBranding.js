"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyBrandingCssVars,
  fetchBranding,
  getCachedBranding,
} from "@/services/brandingService";

const REFRESH_INTERVAL_MS = 45_000;

export function useBranding() {
  const [branding, setBranding] = useState(getCachedBranding);
  const [loading, setLoading] = useState(true);

  const refreshBranding = useCallback(async ({ force = true } = {}) => {
    const data = await fetchBranding({ force });
    setBranding(data);
    applyBrandingCssVars(data);
    if (data.nombreNegocio) {
      document.title = `Carta Online - ${data.nombreNegocio}`;
    }
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await fetchBranding();
      if (cancelled) return;
      setBranding(data);
      applyBrandingCssVars(data);
      if (data.nombreNegocio) {
        document.title = `Carta Online - ${data.nombreNegocio}`;
      }
      setLoading(false);
    })();

    const onFocus = () => {
      refreshBranding({ force: true });
    };

    const intervalId = window.setInterval(() => {
      refreshBranding({ force: true });
    }, REFRESH_INTERVAL_MS);

    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshBranding]);

  return { branding, loading, refreshBranding };
}

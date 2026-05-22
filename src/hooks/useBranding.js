"use client";

import { useEffect, useState } from "react";
import {
  applyBrandingCssVars,
  fetchBranding,
  getCachedBranding,
} from "@/services/brandingService";

export function useBranding() {
  const [branding, setBranding] = useState(getCachedBranding);
  const [loading, setLoading] = useState(true);

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

    return () => {
      cancelled = true;
    };
  }, []);

  return { branding, loading };
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { obtenerConfigEnvioGratis } from "@/services/envioGratisService";

const DEFAULT_CONFIG = {
  activo: false,
  montoMinimo: 0,
};

export function useEnvioGratis(total = 0) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    obtenerConfigEnvioGratis()
      .then((data) => {
        if (!cancelled) {
          setConfig(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConfig(DEFAULT_CONFIG);
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
  }, []);

  const estaAplicado = useMemo(() => {
    const orderTotal = Number(total) || 0;
    return config.activo && orderTotal >= config.montoMinimo;
  }, [config.activo, config.montoMinimo, total]);

  return {
    loading,
    activo: config.activo,
    montoMinimo: config.montoMinimo,
    estaAplicado,
  };
}

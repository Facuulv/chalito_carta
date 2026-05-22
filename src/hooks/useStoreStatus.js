"use client";

import { useState, useEffect } from "react";
import {
  fetchEstadoTienda,
  mapEstadoToStoreStatus,
} from "@/services/estadoTiendaService";

const REFRESH_INTERVAL_MS = 60_000;

const INITIAL_STATUS = {
  isOpen: true,
  message: "Estamos abiertos",
  nextOpeningText: null,
};

/**
 * Hook que expone el estado del local (abierto/cerrado) desde el backend.
 */
export function useStoreStatus() {
  const [status, setStatus] = useState(INITIAL_STATUS);

  useEffect(() => {
    const updateStatus = async () => {
      const estado = await fetchEstadoTienda();
      setStatus(mapEstadoToStoreStatus(estado));
    };

    const initialTimer = setTimeout(() => {
      updateStatus();
    }, 0);

    const interval = setInterval(updateStatus, REFRESH_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return status;
}

"use client";

import { useState, useEffect } from "react";
import { getStoreStatus } from "@/utils/storeSchedule";
import { isStoreHoursValidationEnabled } from "@/config/storeHoursConfig";

const REFRESH_INTERVAL_MS = 60_000; // Actualizar cada 60 segundos

// Estado inicial neutro para evitar hydration mismatch (server vs client pueden tener hora distinta)
const INITIAL_STATUS = { isOpen: true, message: "Estamos abiertos", nextOpeningText: null };

/**
 * Hook que expone el estado del local (abierto/cerrado)
 * Evalúa el estado solo en el cliente para evitar hydration mismatch.
 * Actualiza cada 60 segundos para reflejar cambios de horario sin recargar.
 */
export function useStoreStatus() {
  const [status, setStatus] = useState(INITIAL_STATUS);

  useEffect(() => {
    const updateStatus = () => setStatus(getStoreStatus());
    const initialTimer = setTimeout(updateStatus, 0);
    const interval = setInterval(() => {
      setStatus(getStoreStatus());
    }, REFRESH_INTERVAL_MS);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const shouldValidateStoreHours = isStoreHoursValidationEnabled();

  // Si la validación de horarios está desactivada, exponemos siempre "abierto"
  if (!shouldValidateStoreHours) {
    return {
      isOpen: true,
      message: "Estamos abiertos",
      nextOpeningText: null,
    };
  }

  return {
    isOpen: status.isOpen,
    message: status.message,
    nextOpeningText: status.nextOpeningText,
  };
}

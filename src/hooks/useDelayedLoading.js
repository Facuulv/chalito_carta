import { useEffect, useState } from "react";

/**
 * Evita flicker: retorna true solo si `isLoading` lleva al menos `delayMs` en true.
 * Si la respuesta llega antes del delay, no se muestra skeleton.
 * @param {boolean} isLoading
 * @param {number} [delayMs=150]
 * @returns {boolean}
 */
export function useDelayedLoading(isLoading, delayMs = 150) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer = null;
    if (!isLoading) {
      timer = setTimeout(() => setShowLoading(false), 0);
      return () => clearTimeout(timer);
    }
    timer = setTimeout(() => setShowLoading(true), delayMs);
    return () => clearTimeout(timer);
  }, [isLoading, delayMs]);

  return isLoading && showLoading;
}

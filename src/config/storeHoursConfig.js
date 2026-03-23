/**
 * Configuración para validación de horarios de atención del local (frontend).
 * Replica la semántica del backend para mantener ambos sistemas alineados.
 *
 * Variable de entorno (lado frontend):
 *   NEXT_PUBLIC_ENABLE_STORE_HOURS_VALIDATION=true|false
 *
 * - true  (o no definida): la validación horaria está activa (se respetan horarios)
 * - false / 0 / off / no: se desactiva la validación (bypass de horarios)
 */

const RAW_ENV_VALUE = process.env.NEXT_PUBLIC_ENABLE_STORE_HOURS_VALIDATION;

export function isStoreHoursValidationEnabled() {
  // Si no está definida, mantener comportamiento actual: validación ACTIVADA
  if (RAW_ENV_VALUE === undefined) {
    return true;
  }

  const value = String(RAW_ENV_VALUE).trim().toLowerCase();

  if (value === "false" || value === "0" || value === "off" || value === "no") {
    return false;
  }

  return true;
}

// Compatibilidad interna: derivar la noción de "bypass" desde la nueva bandera
export function isStoreHoursBypassed() {
  return !isStoreHoursValidationEnabled();
}


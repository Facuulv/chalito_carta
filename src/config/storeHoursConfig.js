/**
 * @deprecated La validación horaria se obtiene del backend (validarHorarios en estado-tienda).
 * Fallback legacy para desarrollo local sin API.
 *
 * Variable: NEXT_PUBLIC_ENABLE_STORE_HOURS_VALIDATION=true|false
 */

const RAW_ENV_VALUE = process.env.NEXT_PUBLIC_ENABLE_STORE_HOURS_VALIDATION;

export function isStoreHoursValidationEnabled() {
  if (RAW_ENV_VALUE === undefined) return true;
  const value = String(RAW_ENV_VALUE).trim().toLowerCase();
  if (value === "false" || value === "0" || value === "off" || value === "no") {
    return false;
  }
  return true;
}

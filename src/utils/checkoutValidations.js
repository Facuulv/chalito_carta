/**
 * Validaciones y normalizadores para el checkout finalizar.
 * Reglas exactas según especificación.
 */

import {
  getMontoConCuantoAbonaEfectivoError,
} from "@/utils/checkout/montoConCuantoAbonaRules";

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normaliza nombre: trim + colapsar espacios múltiples */
export function normalizeName(name) {
  if (name == null || typeof name !== "string") return "";
  return name.trim().replace(/\s+/g, " ");
}

/** Valida nombre: 2-50 chars, solo letras/espacios/tildes/ñ/apóstrofe */
export function isValidName(name) {
  const n = normalizeName(name);
  if (n.length < 2 || n.length > 50) return false;
  return NAME_REGEX.test(n);
}

/** Normaliza teléfono: permite +, -, espacios, () */
export function normalizePhone(phone) {
  if (phone == null || typeof phone !== "string") return "";
  return phone.trim();
}

/** Valida teléfono: 8-15 dígitos */
export function isValidPhone(phone) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

/** Valida email (opcional, si no vacío) */
export function isValidEmail(email) {
  const e = (email ?? "").trim();
  if (e === "") return true;
  return EMAIL_REGEX.test(e);
}

/** Normaliza altura: extrae solo dígitos (permite N°, #, espacios en input) */
export function normalizeAltura(alturaRaw) {
  if (alturaRaw == null || typeof alturaRaw !== "string") return "";
  return alturaRaw.replace(/\D/g, "");
}

/**
 * Parsea monto: acepta "10.000", "10000", "10,000"
 * @returns {number|null}
 */
export function parseMoneyNumber(input) {
  if (input == null || typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw) return null;

  const sanitized = raw.replace(/\s/g, "").replace(/[^\d.,]/g, "");
  if (!sanitized) return null;

  const dotCount = (sanitized.match(/\./g) ?? []).length;
  const commaCount = (sanitized.match(/,/g) ?? []).length;

  let normalized = sanitized;

  // Si hay ambos separadores, tomamos el último como decimal y el resto como miles.
  if (dotCount > 0 && commaCount > 0) {
    const lastDot = sanitized.lastIndexOf(".");
    const lastComma = sanitized.lastIndexOf(",");
    const decimalSeparator = lastDot > lastComma ? "." : ",";
    const decimalIndex = Math.max(lastDot, lastComma);
    const integerPart = sanitized.slice(0, decimalIndex).replace(/[.,]/g, "");
    const decimalPart = sanitized.slice(decimalIndex + 1).replace(/[.,]/g, "");
    normalized = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  } else if (dotCount > 0 || commaCount > 0) {
    const separator = dotCount > 0 ? "." : ",";
    const parts = sanitized.split(separator);

    if (parts.length > 2) {
      // Múltiples separadores iguales => miles
      normalized = parts.join("");
    } else {
      const [left, right = ""] = parts;
      // Un solo separador con 3 dígitos a la derecha => miles (20.000 / 20,000)
      if (right.length === 3 && left.length >= 1) {
        normalized = `${left}${right}`;
      } else if (right.length > 0) {
        // Caso decimal normal
        normalized = `${left}.${right}`;
      } else {
        normalized = left;
      }
    }
  }

  const num = Number(normalized);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

/**
 * Valida horario programado.
 * @param {{ mode: string, timeValue: string, minLeadMinutes?: number }}
 * @returns {{ ok: boolean, message?: string }}
 */
export function validateScheduledTime({ mode, timeValue, minLeadMinutes = 10 }) {
  if (mode !== "HORA_PROGRAMADA" && mode !== "programado") {
    return { ok: true };
  }
  const t = (timeValue ?? "").trim();
  if (!t) {
    return { ok: false, message: "Elegí un horario para la entrega." };
  }
  const now = new Date();
  const [hh, mm] = t.split(":").map(Number);
  const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh ?? 0, mm ?? 0);
  const minTime = new Date(now.getTime() + minLeadMinutes * 60 * 1000);
  if (scheduled.getTime() < minTime.getTime()) {
    return {
      ok: false,
      message: `El horario debe ser al menos ${minLeadMinutes} minutos después de ahora.`,
    };
  }
  return { ok: true };
}

/**
 * Valida formulario completo de checkout.
 * Acepta nombres de campos del formulario (tipoEntrega, tipoDemora, etc.)
 * @param {Object} formState - Estado actual del formulario
 * @param {number} cartTotal - Total del carrito
 * @returns {{ ok: boolean, errors: Record<string,string>, firstError: string|null, normalized: Object }}
 */
export function validateCheckoutForm(formState, cartTotal) {
  const errors = {};
  const {
    nombre = "",
    telefono = "",
    email = "",
    tipoDemora,
    cuando,
    horarioProgramado = "",
    horaProgramada = "",
    metodoPago,
    paymentMethod,
    montoEfectivo = "",
    efectivoConCuanto = "",
  } = formState;

  const demora = tipoDemora ?? cuando ?? "cuanto_antes";
  const pago = (metodoPago ?? paymentMethod ?? "").toLowerCase();
  const efectivo = (montoEfectivo ?? efectivoConCuanto ?? "").trim();

  const isHoraProgramada = demora === "HORA_PROGRAMADA" || demora === "programado";
  const isEfectivo = pago === "efectivo";
  const timeVal = (horarioProgramado ?? horaProgramada ?? "").trim();

  // A) Nombre
  if (!isValidName(nombre)) {
    errors.nombre = "Ingresá un nombre válido.";
  }

  // B) Teléfono
  if (!isValidPhone(telefono)) {
    errors.telefono = "Ingresá un teléfono válido.";
  }

  // C) Email (opcional)
  if (!isValidEmail(email)) {
    errors.email = "Email inválido.";
  }

  // D) Horario programado
  const timeResult = validateScheduledTime({
    mode: isHoraProgramada ? "HORA_PROGRAMADA" : "CUANTO_ANTES",
    timeValue: timeVal,
    minLeadMinutes: 10,
  });
  if (!timeResult.ok) {
    errors.horarioProgramado = timeResult.message;
  }

  // E) Payment
  if (!pago) {
    errors.metodoPago = "Elegí un método de pago.";
  }
  if (isEfectivo) {
    const monto = parseMoneyNumber(efectivo);
    if (cartTotal != null && Number.isFinite(Number(cartTotal))) {
      const montoErr = getMontoConCuantoAbonaEfectivoError(monto, Number(cartTotal));
      if (montoErr) {
        errors.montoEfectivo = montoErr;
      }
    } else if (monto === null) {
      errors.montoEfectivo = "Ingresá con cuánto abonás (solo números).";
    }
  }

  const firstErrorKey = Object.keys(errors)[0];
  let firstError = firstErrorKey ? errors[firstErrorKey] : null;
  // horarioProgramado usa el mensaje específico de validateScheduledTime (vacio o < 10 min)

  const normalized = {
    nombre: normalizeName(nombre),
    telefono: normalizePhone(telefono),
    email: (email ?? "").trim() || undefined,
    // Se elimina envio: checkout fijo en retiro.
    deliveryType: "RETIRO",
    cuando: isHoraProgramada ? "HORA_PROGRAMADA" : "CUANTO_ANTES",
    horarioProgramado: isHoraProgramada ? timeVal : undefined,
    paymentMethod: (metodoPago ?? paymentMethod ?? "").toUpperCase(),
    efectivoConCuanto: isEfectivo ? parseMoneyNumber(efectivo) : undefined,
  };

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    firstError,
    normalized,
  };
}

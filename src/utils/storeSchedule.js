import { isStoreHoursValidationEnabled } from "@/config/storeHoursConfig";

/**
 * Horarios del local El Chalito
 * Timezone: America/Argentina/La_Pampa
 * Tolerancia: 5 minutos después del cierre
 */

// Argentina usa un solo huso (ART, UTC-3). Buenos_Aires es el estándar IANA más compatible.
const TIMEZONE = "America/Argentina/Buenos_Aires";
const CLOSE_TOLERANCE_MINUTES = 5;

/**
 * Estructura de horarios por día (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
 * Cada slot: { open: [hora, min], close: [hora, min] }
 * - Miércoles (3): 10:00–13:00 y 18:00–23:00
 * - Jueves (4): 10:00–13:00 y 18:00–23:00
 * - Viernes (5): 10:00–13:00 y 17:00–23:30
 * - Sábado (6): 17:00–23:30
 * - Domingo (0): 17:00–23:30
 */
const SCHEDULE = {
  0: [{ open: [17, 0], close: [23, 30] }], // Domingo
  1: [], // Lunes - cerrado
  2: [], // Martes - cerrado
  3: [
    { open: [10, 0], close: [13, 0] },
    { open: [18, 0], close: [23, 0] },
  ], // Miércoles
  4: [
    { open: [10, 0], close: [13, 0] },
    { open: [18, 0], close: [23, 0] },
  ], // Jueves
  5: [
    { open: [10, 0], close: [13, 0] },
    { open: [17, 0], close: [23, 30] },
  ], // Viernes
  6: [{ open: [17, 0], close: [23, 30] }], // Sábado
};

/**
 * Obtiene la hora actual en el timezone del local
 * Usa Intl para evaluar en America/Argentina/La_Pampa
 */
function getNowInStoreTimezone(date = new Date()) {
  const now = date instanceof Date ? date : new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now instanceof Date ? now : new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "0";
  return new Date(
    parseInt(get("year"), 10),
    parseInt(get("month"), 10) - 1,
    parseInt(get("day"), 10),
    parseInt(get("hour"), 10),
    parseInt(get("minute"), 10),
    parseInt(get("second"), 10)
  );
}

/**
 * Devuelve la estructura de horarios por día
 */
export function getStoreSchedule() {
  return { ...SCHEDULE };
}

/**
 * Evalúa si el local está abierto según timezone America/Argentina/La_Pampa
 * (implementación base sin bypass)
 * Incluye tolerancia de 5 minutos al cierre
 * @param {Date} [now] - Fecha/hora a evaluar (por defecto: ahora)
 */
function isStoreOpenInternal(now = new Date()) {
  const localNow = getNowInStoreTimezone();
  const day = localNow.getDay();
  const slots = SCHEDULE[day] ?? [];
  if (slots.length === 0) return false;

  const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();

  for (const slot of slots) {
    const [openH, openM] = slot.open;
    const [closeH, closeM] = slot.close;
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM + CLOSE_TOLERANCE_MINUTES;

    if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
      return true;
    }
  }
  return false;
}

/**
 * Evalúa si el local está abierto aplicando, si corresponde,
 * la bandera NEXT_PUBLIC_ENABLE_STORE_HOURS_VALIDATION.
 *
 * Cuando la validación está desactivada, siempre devuelve true.
 */
export function isStoreOpen(now = new Date()) {
  // Si la validación de horarios está desactivada, el local se considera siempre abierto.
  if (!isStoreHoursValidationEnabled()) {
    return true;
  }

  return isStoreOpenInternal(now);
}

const DAY_NAMES = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

/**
 * Devuelve mensaje útil sobre el próximo horario de apertura
 * @param {Date} [now] - Fecha/hora de referencia
 * @returns {string|null} - Ej: "Abrimos hoy a las 18:00", "Abrimos mañana a las 17:00"
 */
export function getNextOpeningInfo(now = new Date()) {
  const localNow = getNowInStoreTimezone();
  const day = localNow.getDay();
  const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();

  const findNextSlot = (startDay, startMinutes) => {
    for (let d = 0; d <= 7; d++) {
      const checkDay = (startDay + d) % 7;
      const slots = SCHEDULE[checkDay] ?? [];
      for (const slot of slots) {
        const [openH, openM] = slot.open;
        const openMinutes = openH * 60 + openM;
        const timeStr = `${String(openH).padStart(2, "0")}:${String(openM).padStart(2, "0")}`;

        if (d === 0 && openMinutes > currentMinutes) {
          return { daysAhead: 0, timeStr, dayName: DAY_NAMES[checkDay] };
        }
        if (d > 0) {
          return { daysAhead: d, timeStr, dayName: DAY_NAMES[checkDay] };
        }
      }
    }
    return null;
  };

  const next = findNextSlot(day, currentMinutes);
  if (!next) return null;

  if (next.daysAhead === 0) {
    return `Abrimos hoy a las ${next.timeStr}`;
  }
  if (next.daysAhead === 1) {
    return `Abrimos mañana a las ${next.timeStr}`;
  }
  return `Abrimos el ${next.dayName} a las ${next.timeStr}`;
}

/**
 * Devuelve el estado completo del local
 * @param {Date} [now] - Fecha/hora de referencia
 */
export function getStoreStatus(now = new Date()) {
  const open = isStoreOpen(now);
  const nextOpeningText = open ? null : getNextOpeningInfo(now);
  const message = open
    ? "Estamos abiertos"
    : "Ahora estamos cerrados";

  return {
    isOpen: open,
    message,
    nextOpeningText,
  };
}

/**
 * Lock/unlock body scroll. Soporta múltiples "lockers" (ej. Home + Sidebar).
 * Solo restaura overflow cuando no hay ningún lock activo.
 */
let lockCount = 0;
let previousBodyOverflow = "";

export function lockBodyScroll() {
  if (lockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
  }
  lockCount++;
  document.body.style.overflow = "hidden";
}

export function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousBodyOverflow || "hidden";
    previousBodyOverflow = "";
  }
}

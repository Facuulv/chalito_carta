const STORAGE_PREFIX = 'chalito_wa_opened_';

export function shouldAutoOpenWhatsApp(pedidoId) {
  if (typeof window === 'undefined') return false;
  const id = Number(pedidoId);
  if (!Number.isFinite(id) || id <= 0) return false;
  try {
    return sessionStorage.getItem(`${STORAGE_PREFIX}${id}`) !== '1';
  } catch {
    return true;
  }
}

export function markWhatsAppAutoOpened(pedidoId) {
  if (typeof window === 'undefined') return;
  const id = Number(pedidoId);
  if (!Number.isFinite(id) || id <= 0) return;
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${id}`, '1');
  } catch {
    /* ignore quota / private mode */
  }
}

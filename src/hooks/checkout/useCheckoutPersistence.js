const STORAGE_KEY = 'chalito_checkout_datos';

const DEFAULT_DATA = {
  nombre: '',
  telefono: '',
  email: '',
  calle: '',
  numeroAltura: '',
  entreCalles: '',
  edificioCasa: '',
  pisoDepto: '',
};

export function usarDatosPrevios() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_DATA,
      ...parsed,
    };
  } catch {
    return null;
  }
}

export function guardarDatos(datos = {}) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      ...DEFAULT_DATA,
      ...datos,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function limpiarDatos() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

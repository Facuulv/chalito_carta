/**
 * Construye URL completa de imagen.
 * - Si path es URL absoluta (http/https), se devuelve tal cual.
 * - Si path es local (empieza con / y tiene extensión de imagen), se devuelve tal cual (public/).
 * - Si path es relativa del API, se concatena con la base del API (si aplica).
 * - Si path está vacío, devuelve undefined para usar placeholder.
 */
export function buildImageUrl(path) {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/") && /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(trimmed)) {
    return trimmed;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) return trimmed;
  const baseClean = base.replace(/\/$/, "");
  return trimmed.startsWith("/") ? `${baseClean}${trimmed}` : `${baseClean}/${trimmed}`;
}

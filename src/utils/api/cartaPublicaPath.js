/**
 * Construcción de paths públicos de carta (carrito).
 * Soporta bases con o sin sufijo `/api`.
 */
export function buildCartaPublicaPath(suffixPath, baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "") {
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL no configurada");
  }
  const normalizedBase = String(baseURL).replace(/\/$/, "");
  const usesApiPrefix = /\/api$/i.test(normalizedBase);
  const normalizedSuffix = suffixPath.startsWith("/") ? suffixPath : `/${suffixPath}`;
  const endpointPath = usesApiPrefix
    ? `/carta-publica${normalizedSuffix}`
    : `/api/carta-publica${normalizedSuffix}`;
  return `${normalizedBase}${endpointPath}`;
}

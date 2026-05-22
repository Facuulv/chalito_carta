/**
 * @deprecated Usar estadoTiendaService + GET /carta-publica/estado-tienda
 * Re-exporta helpers de compatibilidad para código legacy.
 */
import {
  canAcceptOnlineOrders,
  getCachedEstadoTienda,
  mapEstadoToStoreStatus,
} from "@/services/estadoTiendaService";

export function getStoreStatus() {
  return mapEstadoToStoreStatus(getCachedEstadoTienda());
}

export { canAcceptOnlineOrders as isStoreOpen };

export function getItemName(item) {
  return item?.name ?? item?.nombre ?? "Producto";
}

export function getItemQuantity(item) {
  return item?.quantity ?? item?.cantidad ?? 1;
}

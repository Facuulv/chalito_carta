export function getPresentacionLabel(nombre) {
  const n = (nombre ?? "").trim().toLowerCase();
  if (n === "hacela doble") return "DOBLE";
  if (n === "hacela triple") return "TRIPLE";
  return null;
}

export function isHamburguesas(categoriaNombre) {
  return (categoriaNombre ?? "").toLowerCase().includes("hamburguesa");
}

export function splitExtrasForHamburguesa(extras) {
  const presentacion = [];
  const otros = [];
  for (const e of extras) {
    const label = getPresentacionLabel(e?.nombre);
    if (label) presentacion.push(label);
    else otros.push(e);
  }
  return { presentacion, otros };
}

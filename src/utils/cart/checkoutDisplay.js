export function getPresentacionLabel(nombre) {
  const n = (nombre ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (n === "hacela doble") return "DOBLE";
  if (n === "hacela triple") return "TRIPLE";
  if (n === "hacela cuadruple") return "CUÁDRUPLE";
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

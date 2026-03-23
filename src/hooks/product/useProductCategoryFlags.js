export function useProductCategoryFlags(producto, categorias) {
  const getCategorySlug = (categoryId) => {
    const category = categorias.find((c) => c.id === categoryId);
    return (category?.slug ?? "").toLowerCase();
  };

  const catNombre = (producto?.categoria_nombre ?? "").toLowerCase();
  const catSlug = getCategorySlug(producto?.categoria_id);

  const isBebidas = catNombre.includes("bebidas") || catSlug.includes("bebidas");
  const isEmpanadas =
    catNombre.includes("empanada") || catSlug.includes("empanada");
  const isSandwiches =
    catNombre.includes("sandwich") || catSlug.includes("sandwich");
  const isPapas = catNombre.includes("papas") || catSlug.includes("papas");

  const slug = catSlug || catNombre;
  const isSimpleFooter =
    slug.includes("bebidas") || slug.includes("empanada") || slug.includes("papas");

  const categoriaPapas =
    categorias.find(
      (c) =>
        (c.slug ?? "").toLowerCase().includes("papas") ||
        (c.nombre ?? "").toLowerCase().includes("papas")
    ) ?? null;

  return {
    isBebidas,
    isEmpanadas,
    isSandwiches,
    isPapas,
    isSimpleFooter,
    isSimpleContent: isBebidas || isEmpanadas,
    categoriaPapas,
  };
}

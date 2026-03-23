"use client";

import { useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  useCatalogStore,
  selectProductsForCategory,
} from "@/store/useCatalogStore";
import { searchProducts } from "@/services/catalogService";
import ProductListItemCard from "@/components/product/ProductListItemCard";

function BuscarContent() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") ?? "";

  const allProducts = useCatalogStore((s) =>
    selectProductsForCategory(s, "all")
  );

  const resultados = useMemo(() => {
    if (!q.trim()) return [];
    return searchProducts(q, allProducts);
  }, [q, allProducts]);

  useEffect(() => {
    useCatalogStore.getState().fetchCategories();
    useCatalogStore.getState().fetchProductsByCategory("all");
  }, []);

  return (
    <div className="flex h-[calc(100dvh-3.25rem)] w-full flex-col overflow-hidden bg-neutral-100">
      <header className="sticky top-0 z-40 flex shrink-0 min-h-[56px] items-center gap-3 border-b border-neutral-200 bg-slate-200 px-4 py-4 shadow-sm">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center header-title-color"
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
        <h1 className="font-anton header-title-color min-w-0 flex-1 truncate text-left text-[22px] font-normal leading-[1.1em]">
          Resultados de búsqueda
        </h1>
      </header>

      <div className="no-scrollbar relative z-0 -mt-12 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <main className="px-4 pt-16 pb-12">
          {!q.trim() ? (
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
              Ingresá un término para buscar.
            </div>
          ) : resultados.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
              No se encontraron productos para &quot;{q}&quot;.
            </div>
          ) : (
            <div className="space-y-3">
              {resultados.map((producto) => (
                <ProductListItemCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-3.25rem)] items-center justify-center bg-neutral-100">
          <p className="text-sm text-slate-500">Cargando...</p>
        </div>
      }
    >
      <BuscarContent />
    </Suspense>
  );
}

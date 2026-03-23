"use client"

import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useCarritoStore } from "@/store/useCarritoStore"
import {
  useCatalogStore,
  selectCategories,
  selectCategoriesLoading,
  selectProductsForCategory,
  selectProductsLoading,
  selectProductsError,
} from "@/store/useCatalogStore"
import { useDelayedLoading } from "@/hooks/useDelayedLoading"
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton"
import ProductListItemCard from "@/components/product/ProductListItemCard"

export default function CategoriaPage() {
  const params = useParams()
  const slug = params?.slug ?? ""
  const categorias = useCatalogStore(selectCategories)
  const categoriesLoading = useCatalogStore(selectCategoriesLoading)
  const categoria = useMemo(() => {
    const bySlug = categorias.find((c) => c.slug === slug)
    if (bySlug) return bySlug
    const numSlug = Number(slug)
    if (!Number.isNaN(numSlug))
      return categorias.find((c) => c.id === numSlug) ?? null
    return null
  }, [categorias, slug])
  const categoryId = categoria?.id ?? (Number(slug) || slug)

  const productos = useCatalogStore((s) =>
    selectProductsForCategory(s, categoryId)
  )
  const loading = useCatalogStore((s) =>
    selectProductsLoading(s, categoryId)
  )
  const error = useCatalogStore((s) =>
    selectProductsError(s, categoryId)
  )
  const showSkeleton = useDelayedLoading(loading && productos.length === 0, 150)
  const hasItems = useCarritoStore((s) => s.items.length > 0)

  useEffect(() => {
    useCatalogStore.getState().fetchCategories()
  }, [])

  useEffect(() => {
    if (categoryId) {
      useCatalogStore.getState().fetchProductsByCategory(categoryId)
    }
  }, [categoryId])

  const handleRetry = () => {
    useCatalogStore.getState().fetchProductsByCategory(categoryId, {
      force: true,
    })
  }

  if (!categoria && !categoriesLoading && categorias.length > 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <Link
          href="/"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </Link>
        <p className="text-center text-slate-600">Categoría no encontrada</p>
        <Link href="/" className="text-sm font-semibold text-blue-600 underline">
          Volver a la carta
        </Link>
      </div>
    )
  }

  const rawNombre = categoria?.nombre ?? (Number.isNaN(Number(slug)) ? slug : "")
  const slugNorm = String(slug ?? "").toLowerCase()
  const catSlug = (categoria?.slug ?? "").toLowerCase()
  const nombreCorregido =
    rawNombre?.toLowerCase() === "sandwiches" ||
    catSlug === "sandwiches" ||
    slugNorm === "sandwiches"
      ? "Sándwiches"
      : rawNombre
  const displayNombre = nombreCorregido ? nombreCorregido.toUpperCase() : ""

  return (
    <div className="flex h-[calc(100dvh-3.25rem)] w-full flex-col overflow-hidden bg-neutral-100">
      <header className="sticky top-0 z-40 flex shrink-0 min-h-[56px] items-center gap-3 border-b border-neutral-200 bg-slate-200 px-4 py-4 shadow-sm">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center header-title-color"
          aria-label="Volver"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
        <h1 className="font-anton header-title-color min-w-0 flex-1 truncate text-left text-[22px] font-normal leading-[1.1em]">
          {displayNombre || "Cargando..."}
        </h1>
      </header>

      <div className="no-scrollbar relative z-0 -mt-12 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <main className={`px-4 pt-16 ${productos.length > 0 ? "pb-16" : hasItems ? "pb-14" : "pb-12"}`}>
          {loading && productos.length === 0 && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} animate={showSkeleton} />
              ))}
            </div>
          )}

          {error && productos.length === 0 && (
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-center">
              <p className="text-sm text-slate-600">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-2 text-sm font-semibold text-slate-800 underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && productos.length === 0 && (
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
              No hay productos en esta categoría.
            </div>
          )}

          {productos.length > 0 && (
            <div className="space-y-3">
              {productos.map((producto) => (
                <ProductListItemCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

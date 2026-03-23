"use client"

import { useEffect, useMemo } from "react"
import {
  useCarritoStore,
  selectCartItems,
} from "@/store/useCarritoStore"
import {
  useCatalogStore,
  selectCategories,
  selectProductsForCategory,
  selectCategoriesLoading,
  selectCategoriesError,
} from "@/store/useCatalogStore"
import { buildImageUrl } from "@/lib/imageUtils"
import { getCategoryImageFromProducts } from "@/lib/categoryImages"
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock"
import { useDelayedLoading } from "@/hooks/useDelayedLoading"
import { useStoreStatus } from "@/hooks/useStoreStatus"
import HomeSkeleton from "@/components/skeletons/HomeSkeleton"
import HeroSlider from "@/components/HeroSlider"
import StoreClosedBanner from "@/components/StoreClosedBanner"
import CategoryCard from "@/components/CategoryCard"

const HERO_IMAGES = [
  { src: "/hero-hamburguesa-cheeseburger.png", alt: "Hamburguesa Cheeseburger" },
  { src: "/hero-lomo.png", alt: "Lomo" },
  { src: "/hero-empanada-carne.png", alt: "Empanada de Carne" },
  { src: "/hero-papas-tastycream.png", alt: "Papas Tastycream" },
  { src: "/hero-vacio.png", alt: "Vacío" },
]

export default function HomePage() {
  const items = useCarritoStore(selectCartItems)
  const hasItems = items.length > 0
  const { isOpen, nextOpeningText } = useStoreStatus()

  const categorias = useCatalogStore(selectCategories)
  const productos = useCatalogStore((s) => selectProductsForCategory(s, "all"))
  const categoriesLoading = useCatalogStore(selectCategoriesLoading)
  const categoriesError = useCatalogStore(selectCategoriesError)

  useEffect(() => {
    useCatalogStore.getState().fetchCategories()
    useCatalogStore.getState().fetchProductsByCategory("all")
  }, [])

  useEffect(() => {
    lockBodyScroll()
    return unlockBodyScroll
  }, [])

  const categoryImages = useMemo(() => {
    const map = {}
    categorias.forEach((cat) => {
      const url = getCategoryImageFromProducts(cat, productos)
      if (url) map[cat.id] = buildImageUrl(url)
    })
    return map
  }, [categorias, productos])

  const heroImages = HERO_IMAGES

  const handleRetry = () => {
    useCatalogStore.getState().fetchCategories({ force: true })
    useCatalogStore.getState().fetchProductsByCategory("all", { force: true })
  }

  const initialLoading = categoriesLoading && categorias.length === 0
  const showInitialSkeleton = useDelayedLoading(initialLoading, 150)
  const hasError = categoriesError && categorias.length === 0

  if (initialLoading) {
    return <HomeSkeleton animate={showInitialSkeleton} />
  }

  if (hasError) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-neutral-100 px-4">
        <p className="text-center text-slate-600">
          {categoriesError || "Error al cargar el catálogo"}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-3.25rem)] w-full flex-col overflow-hidden bg-neutral-100">
      <HeroSlider images={heroImages} />

      {!isOpen && (
        <div className="shrink-0 px-0 pb-2">
          <StoreClosedBanner message="Ahora estamos cerrados" nextOpeningText={nextOpeningText} />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative z-0 -mt-2 shrink-0 bg-slate-200 px-4 pt-8 pb-16">
          <h2 className="font-anton header-title-color text-center text-2xl font-normal tracking-tight">
            Categorías
          </h2>
        </div>

        <div className="no-scrollbar relative z-10 -mt-12 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-transparent">
          <div className={`px-4 pt-4 ${hasItems ? "pb-14" : "pb-6"}`}>
            {categoriesLoading || categorias.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-[110px] animate-pulse rounded-lg bg-slate-200"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {categorias.map((categoria, index) => (
                  <div
                    key={categoria.id}
                    className="category-card-fade-in"
                    style={{ animationDelay: `${0.1 + index * 0.12}s` }}
                  >
                    <CategoryCard
                      categoria={categoria}
                      imageUrl={categoryImages[categoria.id]}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCarritoStore } from "@/store/useCarritoStore";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import {
  useCatalogStore,
  selectProductDetail,
  selectProductDetailLoading,
  selectProductDetailError,
  selectCategories,
  selectProductsForCategory,
} from "@/store/useCatalogStore";
import { buildImageUrl } from "@/lib/imageUtils";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import ProductoDetalleSkeleton from "@/components/skeletons/ProductoDetalleSkeleton";
import ImageWithFade from "@/components/ImageWithFade";
import { formatPrice } from "@/utils/format/price";
import { PLACEHOLDER_PRODUCT_DETAIL_IMG } from "@/constants/images";
import { useProductCategoryFlags } from "@/hooks/product/useProductCategoryFlags";
import { useProductPricing } from "@/hooks/product/useProductPricing";
import { useAddToCartFromDetail } from "@/hooks/product/useAddToCartFromDetail";
import PresentationSelector from "@/components/product/PresentationSelector";
import PersonalizationSection from "@/components/product/PersonalizationSection";
import ProductObservaciones from "@/components/product/ProductObservaciones";
import ProductAddToCartFooter from "@/components/product/ProductAddToCartFooter";

export default function ProductoDetallePage() {
  const { slug } = useParams();
  const router = useRouter();
  const addItem = useCarritoStore((state) => state.addItem);
  const { isOpen } = useStoreStatus();
  const navigatingRef = useRef(false);

  const productId = slug ? (Number(slug) || slug) : null;

  const producto = useCatalogStore((s) => selectProductDetail(s, productId));
  const loading = useCatalogStore((s) => selectProductDetailLoading(s, productId));
  const error = useCatalogStore((s) => selectProductDetailError(s, productId));
  const showSkeletonAnimation = useDelayedLoading(loading && !producto, 150);

  useEffect(() => {
    if (productId) {
      useCatalogStore.getState().fetchProductDetail(productId);
    }
  }, [productId]);

  const categorias = useCatalogStore(selectCategories);
  const {
    isBebidas,
    isEmpanadas,
    isSandwiches,
    isPapas,
    isSimpleFooter,
    isSimpleContent,
    categoriaPapas,
  } = useProductCategoryFlags(producto, categorias);

  const papasProductos = useCatalogStore((s) =>
    selectProductsForCategory(s, categoriaPapas?.id ?? null)
  );

  useEffect(() => {
    useCatalogStore.getState().fetchCategories();
  }, []);

  useEffect(() => {
    if (categoriaPapas?.id) {
      useCatalogStore.getState().fetchProductsByCategory(categoriaPapas.id);
    }
  }, [categoriaPapas?.id]);

  const todosAdicionales = useMemo(() => producto?.extras ?? [], [producto?.extras]);
  const [presentacionCantidades, setPresentacionCantidades] = useState({
    simple: 0,
    doble: 0,
    triple: 0,
  });
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [papasOpen, setPapasOpen] = useState(false);
  const [papasSeleccionadas, setPapasSeleccionadas] = useState({});
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPresentacionCantidades({ simple: 0, doble: 0, triple: 0 });
      setExtrasSeleccionados([]);
      setPapasSeleccionadas({});
      setObservaciones("");
    }, 0);
    return () => clearTimeout(timer);
  }, [productId]);

  useEffect(() => {
    if (productId && isSimpleFooter) {
      const timer = setTimeout(() => {
        setPresentacionCantidades((prev) => ({ ...prev, simple: 1 }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [productId, isSimpleFooter]);

  const { presentacion, extras } = useMemo(() => {
    const nombresPresentacion = ["hacela doble", "hacela triple"];
    const pres = [];
    const ext = [];
    for (const a of todosAdicionales) {
      const nombreNorm = (a.nombre ?? "").trim().toLowerCase();
      if (nombresPresentacion.includes(nombreNorm)) pres.push(a);
      else ext.push(a);
    }
    const doble = pres.find(
      (a) => (a.nombre ?? "").trim().toLowerCase() === "hacela doble"
    );
    const triple = pres.find(
      (a) => (a.nombre ?? "").trim().toLowerCase() === "hacela triple"
    );
    return {
      presentacion: { doble, triple },
      extras: ext,
    };
  }, [todosAdicionales]);

  const setPresentacionCantidad = (tipo, delta) => {
    setPresentacionCantidades((prev) => {
      const actual = prev[tipo] ?? 0;
      const min = isSimpleFooter && tipo === "simple" ? 1 : 0;
      const nuevo = Math.max(min, actual + delta);
      return { ...prev, [tipo]: nuevo };
    });
  };

  const togglePresentacionCheck = (tipo) => {
    setPresentacionCantidades((prev) => {
      const actual = prev[tipo] ?? 0;
      return { ...prev, [tipo]: actual > 0 ? 0 : 1 };
    });
  };

  const toggleExtra = (extraId) => {
    setExtrasSeleccionados((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  };

  const setPapasCantidad = (papasProductId, delta) => {
    setPapasSeleccionadas((prev) => {
      const actual = prev[papasProductId] ?? 0;
      const nuevo = Math.max(0, actual + delta);
      const next = { ...prev };
      if (nuevo > 0) next[papasProductId] = nuevo;
      else delete next[papasProductId];
      return next;
    });
  };

  const { precioSimple, precioDoble, precioTriple, precioUnitario } =
    useProductPricing({
      producto,
      presentacion,
      presentacionCantidades,
      papasSeleccionadas,
      papasProductos,
      todosAdicionales,
      extrasSeleccionados,
    });

  const handleAddToCart = useAddToCartFromDetail({
    producto,
    isOpen,
    presentacionCantidades,
    presentacion,
    todosAdicionales,
    extrasSeleccionados,
    observaciones,
    categorias,
    papasSeleccionadas,
    papasProductos,
    categoriaPapas,
    addItem,
    navigatingRef,
    router,
  });

  if (loading && !producto) {
    return <ProductoDetalleSkeleton animate={showSkeletonAnimation} />;
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen w-full bg-[#fff] p-4">
        <Link
          href="/"
          className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={20} />
        </Link>
        <p className="text-center text-lg font-semibold text-neutral-800">
          {error || "Producto no encontrado"}
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 underline"
          >
            Volver a la carta
          </Link>
          {error && (
            <button
              type="button"
              onClick={() =>
                useCatalogStore.getState().fetchProductDetail(productId, { force: true })
              }
              className="text-sm font-semibold text-slate-800"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  const imagenUrl = buildImageUrl(producto.imagen_url);

  return (
    <div className="flex h-[calc(100dvh-3.25rem)] w-full flex-col overflow-hidden bg-[#fff]">
      <header className="sticky top-0 z-40 flex shrink-0 min-h-[56px] items-center gap-3 border-b border-neutral-200 bg-slate-200 px-4 py-4 shadow-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex shrink-0 items-center justify-center header-title-color"
          aria-label="Volver"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="font-anton header-title-color min-w-0 flex-1 truncate text-left text-[22px] font-normal leading-[1.1em]">
          {producto.nombre}
        </h1>
      </header>

      <div className="no-scrollbar relative z-0 -mt-12 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <div className="px-0 pt-16 pb-20">
          <div className="mb-1" />

          <section className="relative h-[260px] w-full overflow-hidden bg-[#fff]">
            <ImageWithFade
          src={imagenUrl || PLACEHOLDER_PRODUCT_DETAIL_IMG}
          alt={producto.nombre}
          width={400}
          height={260}
          className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = PLACEHOLDER_PRODUCT_DETAIL_IMG;
              }}
            />
          </section>

          {producto.descripcion && (
            <p className="product-description px-4">{producto.descripcion}</p>
          )}

          <main className="font-mini-footer space-y-6 px-4 pt-2 pb-4">
            {(isSimpleContent || isPapas) && (
              <section className="px-3 py-2">
                <p className="text-[1.35rem] font-black leading-none text-slate-800">
                  {formatPrice(precioSimple)}
                </p>
              </section>
            )}
            {!isSimpleContent && !isPapas && (
              <PresentationSelector
                isSandwiches={isSandwiches}
                productoNombre={producto.nombre}
                presentacionCantidades={presentacionCantidades}
                presentacion={presentacion}
                precioSimple={precioSimple}
                precioDoble={precioDoble}
                precioTriple={precioTriple}
                togglePresentacionCheck={togglePresentacionCheck}
                setPresentacionCantidad={setPresentacionCantidad}
              />
            )}

            {(!isSimpleContent || isPapas) && (
              <PersonalizationSection
                extrasOpen={extrasOpen}
                setExtrasOpen={setExtrasOpen}
                extras={extras}
                extrasSeleccionados={extrasSeleccionados}
                toggleExtra={toggleExtra}
                categoriaPapas={categoriaPapas}
                isPapas={isPapas}
                papasOpen={papasOpen}
                setPapasOpen={setPapasOpen}
                papasProductos={papasProductos}
                papasSeleccionadas={papasSeleccionadas}
                setPapasCantidad={setPapasCantidad}
              />
            )}

            {(!isBebidas || isEmpanadas) && (
              <ProductObservaciones
                observaciones={observaciones}
                setObservaciones={setObservaciones}
              />
            )}
          </main>
        </div>
      </div>

      <ProductAddToCartFooter
        isSimpleFooter={isSimpleFooter}
        presentacionCantidades={presentacionCantidades}
        setPresentacionCantidad={setPresentacionCantidad}
        isOpen={isOpen}
        handleAddToCart={handleAddToCart}
        precioUnitario={precioUnitario}
      />
    </div>
  );
}

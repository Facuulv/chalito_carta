"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useCarritoStore,
  selectCartItems,
  selectCartTotal,
} from "@/store/useCarritoStore";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import CheckoutCategoryGroup from "@/components/checkout/CheckoutCategoryGroup";
import CheckoutFooter from "@/components/checkout/CheckoutFooter";
import CheckoutEmptyState from "@/components/checkout/CheckoutEmptyState";
import CheckoutRemoveItemModal from "@/components/checkout/CheckoutRemoveItemModal";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCarritoStore(selectCartItems);
  const total = useCarritoStore(selectCartTotal);
  const removeItem = useCarritoStore((state) => state.removeItem);
  const updateQuantity = useCarritoStore((state) => state.updateQuantity);
  const { isOpen } = useStoreStatus();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [modalBounce, setModalBounce] = useState(false);

  const groupedByCategory = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const cat = (item.categoria_nombre ?? "Otros").trim() || "Otros";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(item);
    }
    return Array.from(map.entries());
  }, [items]);

  if (items.length === 0) {
    return <CheckoutEmptyState />;
  }

  return (
    <div className="flex h-[calc(100dvh-3.25rem)] min-h-0 w-full flex-col overflow-hidden bg-white">
      <header className="sticky top-0 z-40 flex shrink-0 min-h-[68px] items-center gap-3 border-b border-neutral-200 bg-slate-200 px-4 py-5 shadow-sm">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center header-title-color"
          aria-label="Volver"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
        <h1 className="font-anton header-title-color min-w-0 flex-1 truncate text-left text-[22px] font-normal leading-[1.1em]">
          Mi pedido
        </h1>
      </header>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <main className="px-4 py-4 pb-36">
          <div className="space-y-6">
            {groupedByCategory.map(([categoriaNombre, categoriaItems]) => (
              <CheckoutCategoryGroup
                key={categoriaNombre}
                categoriaNombre={categoriaNombre}
                categoriaItems={categoriaItems}
                onAskDelete={setItemToDelete}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>
        </main>
      </div>

      <CheckoutFooter
        isOpen={isOpen}
        total={total}
        onConfirm={() => isOpen && router.push("/checkout/finalizar")}
      />

      <CheckoutRemoveItemModal
        itemToDelete={itemToDelete}
        modalBounce={modalBounce}
        onBackdropClick={() => {
          setModalBounce(true);
          setTimeout(() => setModalBounce(false), 500);
        }}
        onCancel={() => setItemToDelete(null)}
        onConfirm={() => {
          removeItem(itemToDelete.id);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}

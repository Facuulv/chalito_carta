"use client";

import CheckoutItemCard from "@/components/checkout/CheckoutItemCard";

export default function CheckoutCategoryGroup({
  categoriaNombre,
  categoriaItems,
  onAskDelete,
  onUpdateQuantity,
}) {
  return (
    <section>
      <h2
        className="mb-1.5 font-bold leading-tight text-slate-900"
        style={{
          fontSize: "16px",
          fontFamily:
            'var(--font-lato), Lato, "sans-serif", Roboto, Helvetica, Arial, sans-serif',
          lineHeight: 1.2,
        }}
      >
        {categoriaNombre.toUpperCase()}
      </h2>
      <div className="space-y-4">
        {categoriaItems.map((item) => (
          <CheckoutItemCard
            key={item.id}
            item={item}
            onAskDelete={onAskDelete}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </section>
  );
}

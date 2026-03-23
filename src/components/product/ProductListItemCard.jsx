"use client";

import Link from "next/link";
import { buildImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";
import { PLACEHOLDER_PRODUCT_CARD_IMG } from "@/constants/images";
import ImageWithFade from "@/components/ImageWithFade";

export default function ProductListItemCard({ producto }) {
  return (
    <Link
      href={`/producto/${producto.id}`}
      className="flex w-full items-stretch overflow-hidden rounded-lg bg-white text-left shadow-sm ring-1 ring-neutral-200 transition hover:shadow-md"
    >
      <ImageWithFade
        src={buildImageUrl(producto.imagen_url) || PLACEHOLDER_PRODUCT_CARD_IMG}
        alt={producto.nombre}
        width={88}
        height={88}
        loading="lazy"
        className="h-[5.5rem] w-[5.5rem] shrink-0 object-cover"
        onError={(e) => {
          e.target.src = PLACEHOLDER_PRODUCT_CARD_IMG;
        }}
      />
      <div className="flex min-h-[5.5rem] flex-1 flex-col justify-between px-3 pt-3 pb-1.5">
        <h2 className="product-name">{producto.nombre}</h2>
        <p className="font-mini-footer mt-auto ml-1 text-[#21243d]">
          <span className="text-[15px] font-light whitespace-nowrap">Desde </span>
          <span className="product-price ml-1.5 text-[20px] whitespace-nowrap">
            {formatPrice(producto.precio)}
          </span>
        </p>
      </div>
    </Link>
  );
}

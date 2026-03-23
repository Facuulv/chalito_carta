"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ImageWithFade from "./ImageWithFade";

export default function CategoryCard({ categoria, imageUrl }) {
  const href = `/categoria/${categoria.slug ?? categoria.id}`;

  return (
    <Link
      href={href}
      className="group font-category-card relative flex h-[110px] items-center justify-center overflow-hidden rounded-lg bg-slate-300 text-white shadow-md transition active:scale-[0.99]"
    >
      {imageUrl && (
        <ImageWithFade
          src={imageUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover saturate-[1.35]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/45" />
      <h3 className="relative z-10 text-center text-[23px] font-medium leading-tight drop-shadow-md">
        {categoria.nombre}
      </h3>
      <ChevronRight
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 opacity-90 transition-transform duration-200 group-hover:translate-x-0.5 group-active:translate-x-0.5"
        size={24}
      />
    </Link>
  );
}

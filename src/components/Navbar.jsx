"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useCarritoStore } from "@/store/useCarritoStore";

export default function Navbar({ onMenuClick }) {
  const router = useRouter();
  const items = useCarritoStore((state) => state.items);
  const searchQuery = useCarritoStore((state) => state.searchQuery);
  const setSearchQuery = useCarritoStore((state) => state.setSearchQuery);
  const clearSearch = useCarritoStore((state) => state.clearSearch);
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    clearSearch();
  };

  const handleSearchSubmit = () => {
    const q = (searchQuery ?? "").trim();
    if (q) {
      router.push(`/buscar?q=${encodeURIComponent(q)}`);
      setIsSearchOpen(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg">
      <div className="flex h-13 w-full items-center justify-between px-3">
        {isSearchOpen ? (
          <>
            <div className="flex items-center gap-0">
              <button
                type="button"
                onClick={onMenuClick}
                className="relative top-0.5 rounded-md p-1 text-white/90"
                aria-label="Abrir menú"
              >
                <Menu size={26} />
              </button>

              <Link
                href="/"
                className="relative -ml-2.5 flex h-10 w-32 items-center"
                aria-label="Ir al inicio"
              >
                <Image
                  src="/logo-empresa.png"
                  alt="Logo El Chalito"
                  fill
                  sizes="128px"
                  className="object-contain [transform:translateY(-2px)]"
                  priority
                />
              </Link>
            </div>

            <div className="navbar-search-expand relative ml-2 flex h-8 min-w-0 items-center rounded-lg bg-white/95 pl-2 pr-8">
              <Search size={15} className="shrink-0 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar..."
                className="ml-1.5 min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                aria-label="Buscar productos"
              />
              <button
                type="button"
                onClick={handleCloseSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-700"
                aria-label="Cerrar búsqueda"
              >
                <X size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-0">
                <button
                  type="button"
                  onClick={onMenuClick}
                  className="relative top-0.5 rounded-md p-1 text-white/90"
                  aria-label="Abrir menú"
                >
                  <Menu size={26} />
                </button>

              <Link
                href="/"
                className="relative -ml-2.5 flex h-10 w-32 items-center"
                aria-label="Ir al inicio"
              >
                <Image
                  src="/logo-empresa.png"
                  alt="Logo El Chalito"
                  fill
                  sizes="128px"
                  className="object-contain [transform:translateY(-2px)]"
                  priority
                />
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/checkout"
                className="relative top-0.5 rounded-md p-1 text-white/90"
                aria-label="Ver carrito"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-600" />
                )}
              </Link>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="relative top-0.5 rounded-md p-1 text-white/90"
                aria-label="Buscar productos"
              >
                <Search size={22} />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

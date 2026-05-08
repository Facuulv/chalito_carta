"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/ui/Sidebar"
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock"
import {
  useCarritoStore,
  selectCartTotal,
} from "@/store/useCarritoStore"
import { useStoreStatus } from "@/hooks/useStoreStatus"
import { formatPrice } from "@/utils/format/price"

const DESKTOP_BREAKPOINT = 768

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const total = useCarritoStore(selectCartTotal)
  const hasItems = useCarritoStore((s) => s.items.length > 0)
  const { isOpen } = useStoreStatus()
  const isCheckout = pathname?.startsWith("/checkout")
  const isProductoDetalle = pathname?.startsWith("/producto/")
  const isBuscar = pathname === "/buscar"

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
    const handler = () => setIsDesktop(mq.matches)
    handler()
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    if (isSidebarOpen) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
  }, [isSidebarOpen])

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-neutral-100">
      <div className="relative mx-auto flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-white md:max-w-none">
        <Navbar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          <div
            onClick={() => setIsSidebarOpen(false)}
            className={`absolute right-0 top-0 bottom-0 bg-black/30 transition-all duration-[400ms] ease-out ${
              isSidebarOpen
                ? "left-64 z-40 opacity-100 pointer-events-auto"
                : "left-0 z-30 opacity-0 pointer-events-none"
            }`}
            aria-hidden="true"
          />

          <div
            className={`relative z-10 h-full min-h-0 transition-transform duration-[400ms] ease-out ${
              isSidebarOpen ? "translate-x-64" : "translate-x-0"
            }`}
          >
            <main className="h-full w-full overflow-hidden">
              {children}
            </main>
          </div>
        </div>

        {hasItems && isOpen && !isCheckout && !isProductoDetalle && !isBuscar && (
          <div
            className="fixed inset-x-0 bottom-0 z-30 transition-all duration-[400ms] ease-out"
            style={{
              transform:
                isDesktop || !isSidebarOpen
                  ? "translateX(0)"
                  : "translateX(16rem)",
            }}
          >
            <div className="mx-auto w-full max-w-[480px] md:max-w-none">
              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="font-mini-footer flex h-[45px] w-full items-center justify-between bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-[0.9em] text-base font-medium leading-none text-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 hover:brightness-110"
              >
                <span>Ver mi pedido</span>
                <span className="whitespace-nowrap text-[1.2em] font-extrabold">{formatPrice(total)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

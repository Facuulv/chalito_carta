/**
 * Skeleton del detalle de producto.
 * Misma estructura y tamaños que el contenido real.
 * @param {boolean} [animate=true] - Si false, no aplica animate-pulse
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProductoDetalleSkeleton({ animate = true }) {
  const pulse = animate ? "animate-pulse" : "";
  return (
    <div className="min-h-screen w-full bg-neutral-100 pb-28">
      {/* Hero imagen */}
      <section className="relative h-[260px] w-full overflow-hidden bg-neutral-200">
        <div className={`h-full w-full bg-neutral-300 ${pulse}`} />
        <Link
          href="/"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </Link>
      </section>

      <main className="space-y-6 px-4 py-4">
        {/* Título */}
        <section>
          <div className={`h-9 w-3/4 rounded bg-neutral-200 ${pulse}`} />
          <div className={`mt-2 h-7 w-1/4 rounded bg-neutral-200 ${pulse}`} />
        </section>

        {/* Descripción */}
        <section>
          <div className="space-y-2">
            <div className={`h-4 w-full rounded bg-neutral-200 ${pulse}`} />
            <div className={`h-4 w-4/5 rounded bg-neutral-200 ${pulse}`} />
            <div className={`h-4 w-2/3 rounded bg-neutral-200 ${pulse}`} />
          </div>
        </section>

        {/* Extras */}
        <section>
          <div className={`mb-3 h-5 w-16 rounded bg-neutral-200 ${pulse}`} />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex h-14 items-center justify-between rounded-sm border border-neutral-200 bg-white px-3"
              >
                <div className={`h-4 w-32 rounded bg-neutral-200 ${pulse}`} />
                <div className={`h-4 w-12 rounded bg-neutral-200 ${pulse}`} />
              </div>
            ))}
          </div>
        </section>

        {/* Observaciones */}
        <section>
          <div className={`mb-2 h-5 w-28 rounded bg-neutral-200 ${pulse}`} />
          <div className={`h-24 w-full rounded-sm border border-neutral-200 bg-white ${pulse}`} />
        </section>
      </main>

      {/* Botón: espacio reservado */}
      <footer className="fixed inset-x-0 bottom-0 z-30">
        <div className="flex w-full justify-center p-3">
          <div className={`h-11 w-48 rounded-xl bg-neutral-300 ${pulse}`} />
        </div>
      </footer>
    </div>
  );
}

/**
 * Skeleton del Home: Hero + bloque categorías con cards.
 * @param {boolean} [animate=true] - Si false, no aplica animate-pulse
 */
export default function HomeSkeleton({ animate = true }) {
  const pulse = animate ? "animate-pulse" : ""
  return (
    <div className="flex h-[calc(100dvh-3.25rem)] w-full flex-col overflow-hidden bg-neutral-100">
      <section className="relative h-[220px] shrink-0 overflow-hidden bg-neutral-200">
        <div className="flex h-full items-center justify-center text-slate-400">
          Carta Chalito
        </div>
      </section>

      <div className="-mt-2 shrink-0 bg-slate-200 px-4 pt-8 pb-16" />

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-white">
        <div className="-mt-8 space-y-4 px-4 pb-6 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-[110px] rounded-lg bg-slate-200 ${pulse}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

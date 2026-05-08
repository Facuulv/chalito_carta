/**
 * Skeleton del Home: Hero + bloque categorías con cards.
 * @param {boolean} [animate=true] - Si false, no aplica animate-pulse
 */
export default function HomeSkeleton({ animate = true }) {
  const pulse = animate ? "animate-pulse" : ""
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-neutral-100">
      <section className="relative h-[220px] shrink-0 overflow-hidden bg-neutral-200">
        <div className="flex h-full items-center justify-center text-slate-400">
          Carta Chalito
        </div>
      </section>

      <div className="-mt-2 shrink-0 bg-slate-200 px-4 pt-8 pb-16 md:px-6 lg:px-8" />

      <div className="app-scroll-y no-scrollbar flex min-h-0 flex-1 flex-col bg-white">
        <div className="-mt-8 grid w-full grid-cols-1 gap-4 px-4 pb-6 pt-4 md:grid-cols-2 md:px-8 lg:grid-cols-3 xl:grid-cols-4 xl:px-10 2xl:grid-cols-5">
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

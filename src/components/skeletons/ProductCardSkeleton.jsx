/**
 * Skeleton de card de producto.
 * Misma estructura y tamaños que la card real para evitar layout shift.
 * @param {boolean} [animate=true] - Si false, no aplica animate-pulse (evita flicker en cargas rápidas)
 */
export default function ProductCardSkeleton({ animate = true }) {
  const pulse = animate ? "animate-pulse" : "";
  return (
    <div className="flex w-full items-stretch overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-neutral-200">
      <div className={`h-[5.5rem] w-[5.5rem] shrink-0 rounded-lg bg-neutral-200 ${pulse}`} />
      <div className="flex min-h-[5.5rem] flex-1 flex-col justify-between px-3 pt-3 pb-1.5">
        <div className="space-y-1.5">
          <div className={`h-4 w-3/4 rounded bg-neutral-200 ${pulse}`} />
          <div className={`h-4 w-1/2 rounded bg-neutral-200 ${pulse}`} />
        </div>
        <div className="mt-auto ml-1">
          <div className={`h-4 w-1/4 rounded bg-neutral-200 ${pulse}`} />
        </div>
      </div>
    </div>
  );
}

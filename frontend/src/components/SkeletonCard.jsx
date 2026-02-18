export default function SkeletonCard() {
  return (
    <div className="relative aspect-[2/3] h-full overflow-hidden rounded-2xl border border-white/10 bg-surface/60 shadow-card">
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:250%_100%] animate-shimmer" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3">
        <div className="h-4 w-4/5 rounded bg-white/15" />
        <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
      </div>
    </div>
  );
}

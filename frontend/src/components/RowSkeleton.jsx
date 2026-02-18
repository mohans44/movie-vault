export default function RowSkeleton() {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface/60 p-4 shadow-soft animate-pulse">
      <div className="h-28 w-20 flex-shrink-0 rounded-lg bg-white/10" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-5 w-2/3 rounded bg-white/10" />
        <div className="h-4 w-1/3 rounded bg-white/10" />
        <div className="h-3 w-1/4 rounded bg-white/10" />
      </div>
    </li>
  );
}

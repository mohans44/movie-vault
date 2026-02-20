export function MovieDetailsSkeleton() {
  return (
    <div className="relative min-h-screen overflow-hidden text-text-main">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_25%_12%,rgba(8,10,18,0.2),transparent_35%),linear-gradient(to_bottom,rgba(7,9,16,0.3),rgba(7,9,16,0.88)_65%,rgba(7,9,16,1)_100%)]" />

      <div className="relative z-10 pb-4">
        <section className="w-full pt-5 pb-3 sm:py-5 md:py-10">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-[116px_minmax(0,1fr)] items-start gap-2.5 px-3 sm:grid-cols-[160px_1fr] sm:gap-3 sm:px-6 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4 flex justify-start lg:h-[540px]">
              <div className="h-full w-full max-w-[116px] animate-pulse rounded-2xl border border-white/10 bg-surface/55 sm:max-w-[280px] sm:rounded-3xl lg:max-w-[360px]" />
            </div>

            <div className="lg:col-span-8 flex min-h-[220px] flex-col rounded-2xl border border-accent/20 bg-surface/55 p-2.5 sm:rounded-3xl sm:p-3.5 md:p-7 lg:h-[540px]">
              <div className="animate-pulse space-y-2">
                <div className="h-7 w-2/3 rounded bg-surface-2/80 md:h-12" />
                <div className="h-3 w-1/2 rounded bg-surface-2/70 md:h-5" />
                <div className="h-3 w-1/3 rounded bg-surface-2/60 md:h-5" />
              </div>

              <div className="mt-4 animate-pulse space-y-2">
                <div className="h-3.5 w-20 rounded bg-surface-2/80 md:h-5" />
                <div className="h-3 w-full rounded bg-surface-2/70 md:h-4" />
                <div className="h-3 w-11/12 rounded bg-surface-2/70 md:h-4" />
                <div className="h-3 w-10/12 rounded bg-surface-2/70 md:h-4" />
              </div>

              <div className="mt-auto hidden animate-pulse gap-2 sm:flex">
                <div className="h-10 w-24 rounded-xl bg-surface-2/80" />
                <div className="h-10 w-28 rounded-xl bg-surface-2/80" />
                <div className="h-10 w-24 rounded-xl bg-surface-2/80" />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-4 px-3 sm:px-6 md:space-y-6">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-2xl border border-white/10 bg-surface/50 p-3 md:rounded-3xl md:p-4"
            >
              <div className="mb-3 h-5 w-44 rounded bg-surface-2/80" />
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
                {[...Array(5)].map((__, cardIdx) => (
                  <div key={cardIdx} className="space-y-2">
                    <div className="aspect-[2/3] rounded-xl bg-surface-2/80" />
                    <div className="h-3 w-5/6 rounded bg-surface-2/70" />
                    <div className="h-2.5 w-1/2 rounded bg-surface-2/70" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

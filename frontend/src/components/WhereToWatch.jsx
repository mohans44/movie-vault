import { Tv2 } from "lucide-react";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

export function WhereToWatch({ providers = [], region = null, loading = false }) {
  const sectionRef = useRevealOnScroll();
  if (loading) {
    return (
      <section className="relative z-20 py-2">
        <div className="mx-auto max-w-7xl px-2.5 sm:px-6">
          <div className="h-4 w-28 rounded bg-white/10" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 w-12 rounded-xl bg-white/10 sm:h-14 sm:w-14" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!providers.length) return null;

  return (
    <section ref={sectionRef} className="reveal-on-scroll relative z-20 py-2 md:py-4">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-text-main sm:text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <Tv2 size={15} />
            </span>
            Where to Watch
          </h3>
          {region && (
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-text-soft">
              REGION {region}
            </span>
          )}
        </div>

        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-1">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="group flex w-[96px] min-w-[96px] flex-col items-center gap-1.5 p-1 text-center transition"
              title={provider.name}
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-black/25 ring-1 ring-white/10 sm:h-14 sm:w-14">
                {provider.logo ? (
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-[10px] text-text-soft">N/A</span>
                )}
              </div>
              <p className="line-clamp-2 text-[10px] font-medium leading-tight text-text-main/95">
                {provider.name}
              </p>
              {provider.tags?.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {provider.tags.map((tag) => (
                    <span
                      key={`${provider.id}-${tag}`}
                      className="rounded-full border border-white/15 bg-white/5 px-1.5 py-0.5 text-[9px] text-text-soft"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

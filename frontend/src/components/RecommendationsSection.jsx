import { Star } from "lucide-react";
import MovieCarousel from "./MovieCarousel";

export function RecommendationsSection({ recommendations, loading }) {
  return (
    <section className="relative z-20 py-4 md:py-10">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-text-main md:mb-4 md:text-3xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Star size={18} />
          </span>
          You Might Also Like
        </h2>

        {loading ? (
          <RecommendationsSkeleton />
        ) : recommendations.length > 0 ? (
          <MovieCarousel movies={recommendations} title="" />
        ) : (
          <EmptyRecommendations />
        )}
      </div>
    </section>
  );
}

function RecommendationsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-72 w-48 flex-none rounded-xl bg-white/10 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyRecommendations() {
  return (
    <div className="py-12 text-center">
      <div className="mb-4 text-4xl">🔍</div>
      <p className="text-lg text-text-soft">No recommendations available at this time</p>
    </div>
  );
}

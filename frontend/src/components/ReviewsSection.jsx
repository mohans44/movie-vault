import { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import ReviewCard from "./ReviewCard";

const PREVIEW_LIMIT = 5;
const VIEW_ALL_LIMIT = 15;

export function ReviewsSection({ reviews, tmdbReviews, loading, user, onLogMovie }) {
  const [isViewAll, setIsViewAll] = useState(false);

  const visibleReviews = useMemo(() => {
    const websiteReviews = (reviews || [])
      .filter((review) => review.review && review.review.trim().length > 0)
      .map((review) => ({ ...review, source: "flickdeck" }));

    const externalReviews = (tmdbReviews || [])
      .filter((review) => review.review && review.review.trim().length > 0)
      .sort((a, b) => {
        const publishedDelta = Number(Boolean(b.url)) - Number(Boolean(a.url));
        if (publishedDelta !== 0) return publishedDelta;
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return bTime - aTime;
      });

    // Keep website reviews first, then TMDB reviews.
    const combined = [...websiteReviews, ...externalReviews];
    const limit = isViewAll ? VIEW_ALL_LIMIT : PREVIEW_LIMIT;
    return {
      total: combined.length,
      items: combined.slice(0, limit),
    };
  }, [reviews, tmdbReviews, isViewAll]);

  useEffect(() => {
    setIsViewAll(false);
  }, [reviews, tmdbReviews]);

  return (
    <section className="relative z-20 py-3 md:py-6">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mb-2.5 flex items-center justify-between md:mb-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-text-main md:text-2xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <MessageSquare size={16} />
            </span>
            Reviews
          </h2>
          {visibleReviews.total > 0 && (
            <span className="rounded-full border border-white/15 bg-surface/50 px-2 py-0.5 text-[10px] font-medium text-text-soft md:text-xs">
              {visibleReviews.total} total
            </span>
          )}
        </div>

        {loading ? (
          <ReviewsSkeleton />
        ) : visibleReviews.total > 0 ? (
          <div className="space-y-2.5 md:space-y-3">
            {visibleReviews.items.map((review, index) => (
              <ReviewCard
                key={review.id || review.url || `${review.source}-${index}`}
                review={review}
              />
            ))}
            {!isViewAll && visibleReviews.total > PREVIEW_LIMIT && (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsViewAll(true)}
                  className="rounded-md border border-primary/35 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors duration-200 hover:bg-primary/20"
                >
                  View All
                </button>
              </div>
            )}
            {isViewAll && visibleReviews.total > PREVIEW_LIMIT && (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsViewAll(false)}
                  className="rounded-md border border-accent/25 bg-surface/65 px-3.5 py-1.5 text-xs font-semibold text-text-main transition-colors duration-200 hover:border-accent/40 hover:bg-surface/75"
                >
                  Show Less
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyReviews user={user} onLogMovie={onLogMovie} />
        )}
      </div>
    </section>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-2.5 md:space-y-3">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-accent/20 bg-surface/55 p-3">
          <div className="mb-2 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-surface" />
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-surface" />
              <div className="h-2.5 w-14 rounded bg-surface" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-full rounded bg-surface" />
            <div className="h-2.5 w-3/4 rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyReviews({ user, onLogMovie }) {
  return (
    <div className="py-12 text-center">
      <div className="mb-4 text-4xl">💬</div>
      <p className="mb-4 text-lg text-text-soft">
        No reviews yet. Be the first to share your thoughts!
      </p>
      {user && (
        <button
          onClick={onLogMovie}
          className="rounded-xl border border-primary/45 bg-primary/85 px-6 py-3 font-medium text-background transition-colors hover:bg-primary"
        >
          Write a Review
        </button>
      )}
    </div>
  );
}

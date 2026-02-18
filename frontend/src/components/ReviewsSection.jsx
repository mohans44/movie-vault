import { MessageSquare } from "lucide-react";
import ReviewCard from "./ReviewCard";

export function ReviewsSection({ reviews, loading, user, onLogMovie }) {
  const filteredReviews = (reviews || []).filter(
    (review) => review.review && review.review.trim().length > 0
  );

  return (
    <section className="relative z-20 py-3 md:py-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <h2 className="mb-2.5 flex items-center gap-2 font-display text-xl font-bold text-text-main md:mb-3 md:text-3xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <MessageSquare size={16} />
          </span>
          Reviews
        </h2>

        {loading ? (
          <ReviewsSkeleton />
        ) : filteredReviews.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {filteredReviews.map((review, index) => (
              <ReviewCard key={review.id || index} review={review} />
            ))}
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
    <div className="space-y-3 md:space-y-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl bg-white/10 p-4">
          <div className="mb-2.5 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-surface" />
            <div className="space-y-2">
              <div className="h-3.5 w-24 rounded bg-surface" />
              <div className="h-3 w-16 rounded bg-surface" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-surface" />
            <div className="h-3 w-3/4 rounded bg-surface" />
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

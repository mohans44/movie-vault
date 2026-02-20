import { useMemo, useState } from "react";
import { User } from "lucide-react";
import StarRating from "./StarRating";

const REVIEW_PREVIEW_LENGTH = 320;

export default function ReviewCard({ review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasRating = typeof review.rating === "number" && Number.isFinite(review.rating);
  const dateValue = review.watched_date || review.created_at || review.updated_at;
  const hasValidDate = dateValue && !Number.isNaN(new Date(dateValue).getTime());
  const sourceLabel = review.source === "tmdb" ? "TMDB" : "FlickDeck";
  const reviewText = typeof review.review === "string" ? review.review.trim() : "";
  const isLongReview = reviewText.length > REVIEW_PREVIEW_LENGTH;
  const displayText = useMemo(() => {
    if (!isLongReview || isExpanded) return reviewText;
    return `${reviewText.slice(0, REVIEW_PREVIEW_LENGTH).trimEnd()}...`;
  }, [isExpanded, isLongReview, reviewText]);

  return (
    <div className="rounded-xl border border-accent/25 bg-surface/58 p-3 shadow-soft backdrop-blur-sm transition-all duration-200 hover:border-accent/40 hover:bg-surface/68 md:rounded-2xl md:p-3.5">
      <div className="mb-2 flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/10 md:h-8 md:w-8">
            <User size={15} className="text-accent" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text-main md:text-sm">{review.username}</p>
            <div className="flex items-center gap-2 text-xs text-text-soft">
              {hasValidDate && <p>{new Date(dateValue).toLocaleDateString()}</p>}
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-text-soft">
                {sourceLabel}
              </span>
            </div>
          </div>
        </div>
        {hasRating && (
          <div className="flex items-center gap-1">
            <StarRating value={review.rating} size={13} />
          </div>
        )}
      </div>
      {reviewText && (
        <div>
          <p className="text-[12.5px] leading-relaxed text-text-main/95 md:text-[13.5px]">{displayText}</p>
          {isLongReview && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-1.5 text-[11px] font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              {isExpanded ? "View less" : "View more"}
            </button>
          )}
        </div>
      )}
      {review.source === "tmdb" && review.url && (
        <div className="mt-1.5 border-t border-white/10 pt-1.5">
          <a
            href={review.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-[11px] font-medium text-primary underline-offset-2 transition-colors hover:text-primary/80 hover:underline"
          >
            Read on TMDB
          </a>
        </div>
      )}
    </div>
  );
}

import { User } from "lucide-react";
import StarRating from "./StarRating";

export default function ReviewCard({ review }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface/55 p-3 shadow-soft backdrop-blur-sm transition hover:border-accent/30 md:rounded-2xl md:p-4">
      <div className="mb-2.5 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/10 md:h-9 md:w-9">
            <User size={15} className="text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-main">{review.username}</p>
            <p className="text-xs text-text-soft">
              {new Date(
                review.watched_date || review.created_at
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StarRating value={review.rating} size={14} />
        </div>
      </div>
      {review.review && (
        <p className="text-[13px] leading-relaxed text-text-main/95 md:text-sm">{review.review}</p>
      )}
    </div>
  );
}

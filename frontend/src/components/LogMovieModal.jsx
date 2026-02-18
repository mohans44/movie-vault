import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Play, X, Check, Trash2, Calendar, Sparkles } from "lucide-react";
import StarRating from "./StarRating";
import InteractiveStarRating from "./InteractiveStarRating";
import { addRating, editRating, deleteRating } from "../utils/api";

function formatDate(date) {
  if (!date) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getYesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

export default function LogMovieModal({
  movie,
  isOpen,
  onClose,
  existingRating,
  onSuccess,
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isEditing = !!existingRating;
  const communityRating = Math.max(
    0,
    Math.min(5, Number(movie?.rating || movie?.vote_average || 0) / 2)
  );

  useEffect(() => {
    setRating(existingRating?.rating || 0);
    setReview(existingRating?.review || "");
    setWatchedDate(
      existingRating?.watched_date
        ? formatDate(existingRating.watched_date)
        : getToday()
    );
    setError("");
  }, [existingRating, isOpen, movie?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.username || rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const request = isEditing ? editRating : addRating;
      await request(user.username, movie.id, rating, review, formatDate(watchedDate));
      onSuccess(isEditing ? "edit" : "add", {
        rating,
        review,
        watched_date: watchedDate,
      });
      onClose();
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteRating(user.username, movie.id);
      onSuccess("delete");
      onClose();
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4 md:items-start md:p-6 md:pt-24">
      <div className="glass-panel w-full max-w-xl max-h-[92vh] overflow-hidden rounded-3xl shadow-card">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-text-main">
            <Play size={18} className="text-accent" />
            {isEditing ? "Edit your log" : "Log this movie"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-text-soft transition hover:bg-white/10 hover:text-text-main"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-4 md:px-6">
          <div className="flex gap-4 rounded-2xl border border-white/10 bg-background/30 p-3">
            <img
              src={movie.poster_path || "/no-image.svg"}
              alt={movie.title}
              className="h-24 w-16 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-base font-semibold text-text-main md:text-lg">
                {movie.title}
              </h3>
              <p className="mt-1 text-sm text-text-soft">
                {movie.release_date?.slice(0, 4) || "Unknown"}
                {movie.director ? ` • ${movie.director}` : ""}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-text-soft">
                <Sparkles size={12} className="text-accent" />
                Community rating
                <StarRating value={communityRating} size={12} showText={false} />
                <span className="rounded-full bg-black/25 px-2 py-0.5 font-semibold text-text-main">
                  {communityRating.toFixed(1)}/5
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[62vh] overflow-y-auto px-5 py-5 md:px-6">
          <div className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-background/25 p-4">
              <label className="mb-2 block text-sm font-semibold text-text-main">
                Your rating <span className="text-red-300">*</span>
              </label>
              <div className="flex items-center justify-center py-2">
                <InteractiveStarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size={34}
                />
              </div>
              <p className="mt-2 text-center text-sm text-text-soft">
                {rating > 0 ? `${rating}/5 stars` : "Tap a star to rate"}
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-background/25 p-4">
              <label className="mb-2 block text-sm font-semibold text-text-main">
                Watched date
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setWatchedDate(getToday())}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-text-main hover:bg-white/10"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setWatchedDate(getYesterday())}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-text-main hover:bg-white/10"
                >
                  Yesterday
                </button>
              </div>
              <div className="relative">
                <Calendar
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-soft"
                />
                <input
                  type="date"
                  value={watchedDate}
                  onChange={(event) => setWatchedDate(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-background/35 py-2.5 pl-9 pr-3 text-sm text-text-main outline-none focus:border-primary/60"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-background/25 p-4">
              <label className="mb-2 block text-sm font-semibold text-text-main">
                Review (optional)
              </label>
              <textarea
                value={review}
                onChange={(event) => setReview(event.target.value)}
                placeholder="What worked, what didn’t, and how did it feel?"
                className="h-36 w-full resize-none rounded-xl border border-white/15 bg-background/35 p-3 text-sm leading-relaxed text-text-main placeholder:text-text-soft/80 outline-none focus:border-primary/60"
                maxLength={500}
              />
              <p className="mt-1 text-right text-xs text-text-soft">{review.length}/500</p>
            </section>

            {error && (
              <div className="rounded-xl border border-red-500/35 bg-red-500/12 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 mt-5 flex flex-wrap gap-2 border-t border-white/10 bg-[rgba(20,24,36,0.9)] pt-4 backdrop-blur-lg">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/18 disabled:opacity-50"
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-text-soft transition hover:bg-white/10 hover:text-text-main"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/45 bg-primary/85 px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-primary disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
              ) : (
                <>
                  <Check size={15} />
                  {isEditing ? "Save Changes" : "Log Movie"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Play, X, Check, Trash2, Calendar, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseYmd(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day, 12, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toYmd(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthLabel(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const isEditing = !!existingRating;
  const communityRating = Math.max(
    0,
    Math.min(5, Number(movie?.rating || movie?.vote_average || 0) / 2)
  );
  const posterSrc = movie?.poster_path || "/no-image.svg";
  const posterSrcSet = movie?.poster_path_raw
    ? [
        `https://image.tmdb.org/t/p/w185${movie.poster_path_raw} 185w`,
        `https://image.tmdb.org/t/p/w342${movie.poster_path_raw} 342w`,
        `https://image.tmdb.org/t/p/w500${movie.poster_path_raw} 500w`,
      ].join(", ")
    : undefined;

  useEffect(() => {
    const initialWatchedDate =
      existingRating?.watched_date
        ? formatDate(existingRating.watched_date)
        : getToday();
    setRating(existingRating?.rating || 0);
    setReview(existingRating?.review || "");
    setWatchedDate(initialWatchedDate);
    const baseDate = parseYmd(initialWatchedDate) || new Date();
    setCalendarMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
    setCalendarOpen(false);
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

  const selectedDate = parseYmd(watchedDate);

  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const mondayIndexedStart = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < mondayIndexedStart; i += 1) {
      cells.push({ key: `pad-start-${i}`, inMonth: false, day: null, value: null });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const value = toYmd(new Date(year, month, day));
      cells.push({ key: value, inMonth: true, day, value });
    }
    while (cells.length % 7 !== 0) {
      cells.push({
        key: `pad-end-${cells.length}`,
        inMonth: false,
        day: null,
        value: null,
      });
    }
    return cells;
  }, [calendarMonth]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-2.5 md:items-start md:p-6 md:pt-24">
      <div className="glass-panel w-full max-w-[94vw] max-h-[88vh] overflow-hidden rounded-2xl shadow-card md:max-w-xl md:max-h-[92vh] md:rounded-3xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 md:px-6 md:py-4">
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

        <div className="border-b border-white/10 px-4 py-3.5 md:px-6 md:py-4">
          <div className="flex gap-3 rounded-2xl border border-white/10 bg-background/30 p-2.5 md:gap-4 md:p-3">
            <img
              src={posterSrc}
              srcSet={posterSrcSet}
              sizes="64px"
              alt={movie.title}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-20 w-14 rounded-lg object-cover md:h-24 md:w-16"
            />
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-semibold text-text-main md:text-lg">
                {movie.title}
              </h3>
              <p className="mt-1 text-xs text-text-soft md:text-sm">
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

        <form onSubmit={handleSubmit} className="max-h-[54vh] overflow-y-auto px-4 py-4 md:max-h-[62vh] md:px-6 md:py-5">
          <div className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-background/25 p-3 md:p-4">
              <label className="mb-2 block text-sm font-semibold text-text-main">
                Your rating <span className="text-red-300">*</span>
              </label>
              <div className="flex items-center justify-center py-2">
                <InteractiveStarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size={30}
                />
              </div>
              <p className="mt-2 text-center text-sm text-text-soft">
                {rating > 0 ? `${rating}/5 stars` : "Tap a star to rate"}
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-background/25 p-3 md:p-4">
              <label className="mb-2 block text-sm font-semibold text-text-main">
                Watched date
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = getToday();
                    setWatchedDate(today);
                    const parsed = parseYmd(today);
                    if (parsed) {
                      setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
                    }
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-text-main hover:bg-white/10"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const yesterday = getYesterday();
                    setWatchedDate(yesterday);
                    const parsed = parseYmd(yesterday);
                    if (parsed) {
                      setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
                    }
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-text-main hover:bg-white/10"
                >
                  Yesterday
                </button>
              </div>
              <div className="relative space-y-2">
                <Calendar
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-soft"
                />
                <button
                  type="button"
                  onClick={() => setCalendarOpen((prev) => !prev)}
                  className="w-full rounded-xl border border-white/15 bg-background/35 py-2.5 pl-9 pr-3 text-left text-sm text-text-main outline-none transition hover:bg-white/5"
                >
                  {selectedDate
                    ? selectedDate.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Select watched date"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-background/25 p-3 md:p-4">
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
      {calendarOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 backdrop-blur-sm"
          onClick={() => setCalendarOpen(false)}
        >
          <div
            className="w-[min(92vw,360px)] rounded-2xl border border-white/15 bg-surface/90 p-3.5 shadow-card backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                  )
                }
                className="rounded-md border border-white/15 bg-white/5 p-1.5 text-text-soft hover:bg-white/10 hover:text-text-main"
                aria-label="Previous month"
              >
                <ChevronLeft size={14} />
              </button>
              <p className="text-sm font-semibold text-text-main">
                {monthLabel(calendarMonth)}
              </p>
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                  )
                }
                className="rounded-md border border-white/15 bg-white/5 p-1.5 text-text-soft hover:bg-white/10 hover:text-text-main"
                aria-label="Next month"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((day) => (
                <span
                  key={day}
                  className="text-center text-[10px] font-semibold uppercase tracking-wide text-text-soft"
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell) => {
                if (!cell.inMonth) {
                  return <span key={cell.key} className="h-8" />;
                }
                const isSelected = cell.value === watchedDate;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => {
                      setWatchedDate(cell.value);
                      setCalendarOpen(false);
                    }}
                    className={`h-8 rounded-md text-xs font-medium transition ${
                      isSelected
                        ? "border border-primary/50 bg-primary/20 text-primary"
                        : "border border-white/10 bg-white/5 text-text-main hover:bg-white/10"
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setCalendarOpen(false)}
                className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-text-soft hover:bg-white/10 hover:text-text-main"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Calendar, Clock, Check, Edit3 } from "lucide-react";
import StarRating from "./StarRating";
import { MovieActions } from "./MovieActions";
import MetricBadge from "./MetricBadge";

function formatWatchedDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MovieHero({
  movie,
  existingRating,
  isLogged,
  isInWatchlist,
  onLogMovie,
  onWatchlistAction,
  onShare,
  watchlistLoading,
  shareSuccess,
  watchlistFeedback,
}) {
  const genreChips = (movie.genres || []).map((genre) => (
    <span
      key={genre.id || genre.name}
      className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent"
    >
      {genre.name}
    </span>
  ));

  return (
    <div className="relative w-full pt-5 pb-2 sm:py-4 md:py-10">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[140px_1fr] items-stretch gap-3 px-2.5 sm:px-6 lg:min-h-[540px] lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4 flex justify-start lg:h-full lg:justify-start">
          <div className="w-full max-w-[140px] sm:max-w-[280px] lg:h-full lg:max-w-[320px]">
            <div className="relative group lg:h-full">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-accent/15 blur-xl transition-transform duration-300 group-hover:scale-105" />
              <img
                src={movie.poster_path || "/no-image.svg"}
                alt={movie.title}
                className="h-[220px] w-full rounded-2xl border border-white/15 object-cover shadow-card sm:h-full sm:min-h-[400px] sm:rounded-3xl lg:min-h-0"
              />
              {isLogged && (
                <div className="absolute right-2 top-2 rounded-full border border-accent/35 bg-accent/90 p-1.5 text-text-main sm:right-4 sm:top-4 sm:p-2">
                  <Check size={16} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex min-h-[220px] flex-col space-y-2 rounded-2xl border border-white/10 bg-black/20 p-2.5 backdrop-blur-md sm:h-full sm:space-y-4 sm:rounded-3xl sm:p-3.5 md:p-7 lg:min-h-[540px]">
          <div className="space-y-1">
            <h1 className="line-clamp-2 font-display text-base font-bold leading-tight text-text-main sm:text-3xl md:text-6xl">
              {movie.title}
            </h1>
            {movie.director && (
              <p className="text-[10px] font-medium text-accent sm:text-sm md:text-lg">
                Directed by {movie.director}
              </p>
            )}
            {movie.tagline && movie.tagline.trim() && (
              <p className="line-clamp-1 text-[10px] italic text-text-soft sm:text-sm md:text-xl">
                "{movie.tagline}"
              </p>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-xs font-semibold text-text-main sm:text-sm md:text-xl">Overview</h3>
            <p className="line-clamp-5 max-w-3xl text-[10px] leading-relaxed text-text-main/90 sm:text-[12px] md:text-lg">
              {movie.overview || "No overview available."}
            </p>
          </div>

          <div className="hidden flex-wrap gap-1.5 sm:flex sm:gap-2">
            <MetricBadge
              icon={Calendar}
              value={movie.release_date?.slice(0, 4) || "N/A"}
              label="Year"
            />
            <div className="rounded-xl border border-white/10 bg-black/25 px-2.5 py-1.5 backdrop-blur-sm sm:px-3 sm:py-2">
              <StarRating value={movie.rating / 2 || 0} size={16} showText={true} />
            </div>
            {movie.runtime && (
              <MetricBadge
                icon={Clock}
                value={`${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`}
                label="Runtime"
              />
            )}
          </div>

          {isLogged && existingRating && (
            <div className="hidden rounded-xl border border-accent/30 bg-accent/10 px-2 py-2 backdrop-blur-sm sm:block sm:rounded-2xl sm:px-4 sm:py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-accent md:text-sm">Your Rating</p>
                  <StarRating value={existingRating.rating} size={16} />
                  {formatWatchedDate(existingRating.watched_date) && (
                    <p className="mt-1 text-[10px] text-text-soft md:text-xs">
                      Watched on {formatWatchedDate(existingRating.watched_date)}
                    </p>
                  )}
                </div>
                <button
                  onClick={onLogMovie}
                  className="rounded-lg p-2 transition hover:bg-accent/20"
                >
                  <Edit3 size={16} className="text-accent" />
                </button>
              </div>
              {existingRating.review && (
                <p className="mt-1.5 text-[11px] italic text-text-main/85 md:text-sm">"{existingRating.review}"</p>
              )}
            </div>
          )}

          {genreChips.length > 0 && <div className="hidden flex-wrap gap-2 sm:flex">{genreChips}</div>}

          <div className="hidden sm:block">
            <MovieActions
              isLogged={isLogged}
              isInWatchlist={isInWatchlist}
              onLogMovie={onLogMovie}
              onWatchlistAction={onWatchlistAction}
              onShare={onShare}
              watchlistLoading={watchlistLoading}
              shareSuccess={shareSuccess}
              watchlistFeedback={watchlistFeedback}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-3 w-full max-w-7xl px-2.5 sm:hidden">
        <div className="space-y-2 rounded-2xl border border-white/10 bg-surface/40 p-2.5 backdrop-blur-md">
          <div className="flex flex-wrap gap-1.5">
            <MetricBadge
              icon={Calendar}
              value={movie.release_date?.slice(0, 4) || "N/A"}
              label="Year"
            />
            <div className="rounded-xl border border-white/10 bg-black/25 px-2.5 py-1.5 backdrop-blur-sm">
              <StarRating value={movie.rating / 2 || 0} size={15} showText={true} />
            </div>
            {movie.runtime && (
              <MetricBadge
                icon={Clock}
                value={`${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`}
                label="Runtime"
              />
            )}
          </div>

          {genreChips.length > 0 && <div className="flex flex-wrap gap-1.5">{genreChips}</div>}

          {isLogged && existingRating && (
            <div className="rounded-xl border border-accent/30 bg-accent/10 px-2 py-1.5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-accent">Your Rating</p>
                  <StarRating value={existingRating.rating} size={13} />
                  {formatWatchedDate(existingRating.watched_date) && (
                    <p className="mt-0.5 text-[10px] text-text-soft">
                      Watched on {formatWatchedDate(existingRating.watched_date)}
                    </p>
                  )}
                </div>
                <button
                  onClick={onLogMovie}
                  className="rounded-lg p-1.5 transition hover:bg-accent/20"
                >
                  <Edit3 size={13} className="text-accent" />
                </button>
              </div>
              {existingRating.review && (
                <p className="mt-1 text-[10px] italic text-text-main/85">"{existingRating.review}"</p>
              )}
            </div>
          )}

          <div className="mt-2.5">
            <MovieActions
              isLogged={isLogged}
              isInWatchlist={isInWatchlist}
              onLogMovie={onLogMovie}
              onWatchlistAction={onWatchlistAction}
              onShare={onShare}
              watchlistLoading={watchlistLoading}
              shareSuccess={shareSuccess}
              watchlistFeedback={watchlistFeedback}
              compactMobile={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

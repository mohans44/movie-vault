import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

function getRatingTone(rating) {
  if (rating > 3.5) return "text-cyan-300";
  if (rating > 2) return "text-sky-300";
  return "text-rose-300";
}

export default function MovieCard({ movie, prioritize = false }) {
  const navigate = useNavigate();
  const rating = (movie.vote_average || movie.rating || 0) / 2;
  const [imageLoaded, setImageLoaded] = useState(false);
  const posterPath = movie.poster_path;
  const hasFullPosterUrl = typeof posterPath === "string" && posterPath.startsWith("http");
  const posterSrc = hasFullPosterUrl
    ? posterPath
    : posterPath
      ? `https://image.tmdb.org/t/p/w185${posterPath}`
      : "/no-image.svg";
  const posterSrcSet =
    !posterPath || hasFullPosterUrl
      ? undefined
      : `https://image.tmdb.org/t/p/w185${posterPath} 185w, https://image.tmdb.org/t/p/w342${posterPath} 342w, https://image.tmdb.org/t/p/w500${posterPath} 500w`;

  useEffect(() => {
    setImageLoaded(false);
  }, [movie.id, movie.poster_path]);

  return (
    <div
      className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-surface/60 shadow-card"
      onClick={() => navigate(`/movies/${movie.id}`)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate(`/movies/${movie.id}`);
        }
      }}
    >
      <img
        src={posterSrc}
        srcSet={posterSrcSet}
        sizes="(max-width: 640px) 23vw, (max-width: 1024px) 24vw, 18vw"
        alt={movie.title}
        loading={prioritize ? "eager" : "lazy"}
        fetchPriority={prioritize ? "high" : "auto"}
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        className={`h-full w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        draggable={false}
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:250%_100%] animate-shimmer ${
          imageLoaded ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-2 sm:p-3">
        <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-text-main sm:text-sm">
          {movie.title}
        </p>
        {rating > 0 && (
          <div className={`mt-1 flex items-center gap-1 text-[10px] sm:text-xs ${getRatingTone(rating)}`}>
            <Star size={11} fill="currentColor" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

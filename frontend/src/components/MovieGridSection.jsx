import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";

export function MovieGridSection({
  loading,
  movies,
  icon,
  title,
  loadingText,
  emptyText,
  emptySub,
  gridKey = "id",
  mobileDense = false,
  maxWidthClass = "max-w-6xl",
}) {
  const countText =
    title === "Watched Movies"
      ? `You have watched ${movies.length} movie${movies.length !== 1 ? "s" : ""}`
      : `You saved ${movies.length} movie${movies.length !== 1 ? "s" : ""} for later`;

  return (
    <div className="min-h-screen text-text-main">
      <header className={`mx-auto mb-3 mt-2 w-full px-2.5 sm:px-4 md:mb-6 md:mt-4 lg:px-6 ${maxWidthClass}`}>
        <div
          className={`glass-panel overflow-hidden rounded-3xl border border-white/15 shadow-card ${
            mobileDense ? "p-3.5 sm:p-5 md:p-7" : "p-4 md:p-8"
          }`}
        >
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent sm:h-10 sm:w-10 md:h-12 md:w-12">
            {icon}
          </div>
          <h1
            className={`font-display font-bold tracking-tight ${
              mobileDense ? "text-lg sm:text-xl md:text-4xl" : "text-xl md:text-4xl"
            }`}
          >
            {title}
          </h1>
          <p className={`mt-1.5 text-text-soft ${mobileDense ? "text-[11px] sm:text-xs md:text-base" : "text-xs md:text-base"}`}>
            {loading ? loadingText : movies.length === 0 ? emptyText : countText}
          </p>
        </div>
      </header>

      <main className={`mx-auto w-full flex-1 px-2.5 pb-8 sm:px-4 lg:px-6 ${maxWidthClass}`}>
        {loading ? (
          <SkeletonRow mobileDense={mobileDense} />
        ) : movies.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-surface/45 py-16 text-center shadow-soft">
            <p className="text-lg font-semibold text-text-main">{emptyText}</p>
            <p className="mt-2 text-sm text-text-soft">{emptySub}</p>
          </div>
        ) : (
          <div
            className={`grid ${
              mobileDense
                ? "grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                : "grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            }`}
          >
            {movies.map((movie) =>
              movie ? <MovieCard key={movie[gridKey]} movie={movie} /> : null
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SkeletonRow({ mobileDense = false }) {
  return (
    <div
      className={`grid ${
        mobileDense
          ? "grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          : "grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      }`}
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

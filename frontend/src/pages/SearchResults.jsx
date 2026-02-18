import RowSkeleton from "../components/RowSkeleton";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { searchAll } from "../utils/api";
import { Star, Calendar, TrendingUp, Users, Clapperboard, Film } from "lucide-react";

const MOVIE_SORT_OPTIONS = [
  { value: "popularity", text: "Original (Popularity)" },
  { value: "date-desc", text: "Release Date (Newest First)" },
  { value: "date-asc", text: "Release Date (Oldest First)" },
  { value: "rating-desc", text: "Rating (Highest First)" },
  { value: "rating-asc", text: "Rating (Lowest First)" },
];

function getMovieRatingColor(rating) {
  const normalizedRating = rating / 2;
  if (normalizedRating > 3.5) return "text-cyan-300";
  if (normalizedRating > 2) return "text-sky-300";
  return "text-rose-300";
}

function getPopularityBadge(popularity) {
  if (popularity > 100) return "bg-rose-500/20 text-rose-200 border-rose-400/30";
  if (popularity > 50) return "bg-indigo-500/20 text-indigo-200 border-indigo-400/30";
  if (popularity > 20) return "bg-sky-500/20 text-sky-200 border-sky-400/30";
  return null;
}

function mapPersonRole(person) {
  const department = (person?.known_for_department || "").toLowerCase();
  if (department.includes("acting")) return "acting";
  if (department.includes("direct")) return "directing";
  if (department.includes("product")) return "production";
  if (department.includes("writ")) return "writing";
  if (department.includes("sound")) return "sound";
  return "crew";
}

function getProfessionLabel(person) {
  const department = (person?.known_for_department || "").toLowerCase();
  if (department.includes("acting")) return "Actor";
  if (department.includes("direct")) return "Director";
  if (department.includes("product")) return "Producer";
  if (department.includes("writ")) return "Writer";
  if (department.includes("sound")) return "Sound";
  return person?.known_for_department || "Crew";
}

export default function SearchResults() {
  const query = new URLSearchParams(useLocation().search).get("q");
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popularity");
  const [showMovies, setShowMovies] = useState(true);
  const [showCast, setShowCast] = useState(true);
  const [showCrew, setShowCrew] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (!query) {
      setMovies([]);
      setCast([]);
      setCrew([]);
      setLoading(false);
      return;
    }

    searchAll(query)
      .then((result) => {
        const currentYear = new Date().getFullYear();

        const filteredMovies = (result.movies || []).filter((movie) => {
          const hasPoster = !!movie.poster_path;
          const hasTitle = !!movie.title;
          const rating = movie.rating || movie.vote_average || 0;
          const year = movie.release_date
            ? parseInt(movie.release_date.slice(0, 4), 10)
            : null;
          return hasPoster && hasTitle && (rating > 0 || year >= currentYear);
        });

        setMovies(filteredMovies);
        setCast((result.cast || []).filter((person) => person.name));
        setCrew((result.crew || []).filter((person) => person.name));
      })
      .catch(() => {
        setMovies([]);
        setCast([]);
        setCrew([]);
      })
      .finally(() => setLoading(false));
  }, [query]);

  const sortedMovies = useMemo(() => {
    const getYear = (movie) =>
      movie.release_date ? parseInt(movie.release_date.slice(0, 4), 10) : 0;
    const getRating = (movie) => movie.rating || movie.vote_average || 0;

    return [...movies].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return getYear(b) - getYear(a);
        case "date-asc":
          return getYear(a) - getYear(b);
        case "rating-desc":
          return getRating(b) - getRating(a);
        case "rating-asc":
          return getRating(a) - getRating(b);
        default:
          return 0;
      }
    });
  }, [movies, sortBy]);

  const totalVisibleCount =
    (showMovies ? sortedMovies.length : 0) +
    (showCast ? cast.length : 0) +
    (showCrew ? crew.length : 0);

  const emptyAll = !loading && movies.length === 0 && cast.length === 0 && crew.length === 0;

  return (
    <div className="min-h-screen px-2.5 pb-8 pt-2.5 sm:px-6 sm:pb-10 sm:pt-3">
      <main className="mx-auto w-full max-w-7xl">
        <div className="mb-4 overflow-hidden rounded-3xl border border-white/15 p-3.5 glass-panel md:mb-7 md:p-6">
          <h1 className="font-display text-xl font-bold tracking-tight text-text-main md:text-4xl">
            Search results
            {query && <span className="text-primary"> for "{query}"</span>}
          </h1>

          <div className="mt-2.5 flex flex-col gap-2.5 md:mt-4 md:gap-3">
            <p className="text-xs text-text-soft md:text-sm">
              {!loading && totalVisibleCount > 0
                ? `Showing ${totalVisibleCount} result${totalVisibleCount !== 1 ? "s" : ""}`
                : "Find movies, cast, and crew"}
            </p>

            <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1">
              <button
                type="button"
                onClick={() => setShowMovies((value) => !value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  showMovies
                    ? "border-primary/45 bg-primary/15 text-text-main"
                    : "border-white/15 bg-white/5 text-text-soft"
                }`}
              >
                Movies ({movies.length})
              </button>
              <button
                type="button"
                onClick={() => setShowCast((value) => !value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  showCast
                    ? "border-primary/45 bg-primary/15 text-text-main"
                    : "border-white/15 bg-white/5 text-text-soft"
                }`}
              >
                Cast ({cast.length})
              </button>
              <button
                type="button"
                onClick={() => setShowCrew((value) => !value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  showCrew
                    ? "border-primary/45 bg-primary/15 text-text-main"
                    : "border-white/15 bg-white/5 text-text-soft"
                }`}
              >
                Crew ({crew.length})
              </button>
            </div>

            {showMovies && (
              <label className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em] text-text-soft md:max-w-[380px] md:text-xs">
                Movie sort
                <select
                  className="min-w-[150px] rounded-xl border border-white/15 bg-surface/75 px-3 py-2 text-[11px] font-semibold tracking-normal text-text-main focus:border-primary/60 focus:outline-none md:min-w-[190px] md:text-xs"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  {MOVIE_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.text}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <RowSkeleton key={index} />
            ))}
          </div>
        ) : emptyAll ? (
          <div className="rounded-3xl border border-white/10 bg-surface/45 py-20 text-center shadow-soft">
            <p className="text-xl font-semibold text-text-main">No results found</p>
            <p className="mt-2 text-sm text-text-soft">
              {query
                ? `We couldn't find results matching "${query}". Try a broader keyword.`
                : "Try searching by title, cast, or crew name."}
            </p>
          </div>
        ) : (
          <div className="space-y-5 md:space-y-7">
            {showMovies && sortedMovies.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold text-text-main">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                    <Film size={17} />
                  </span>
                  Movies
                </h2>
                <div className="grid gap-3 md:gap-4">
                  {sortedMovies.map((movie) => {
                    const rating = (movie.rating || movie.vote_average || 0) / 2;
                    const popularity = movie.popularity || 0;
                    const badgeClass = getPopularityBadge(popularity);
                    const releaseYear = movie.release_date?.slice(0, 4);
                    const posterSrc = movie.poster_path
                      ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                      : "/no-image.svg";

                    return (
                      <article
                        key={`movie-${movie.id}`}
                        className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-surface/65 p-3 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30 md:p-4"
                        onClick={() => navigate(`/movies/${movie.id}`)}
                      >
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-xl sm:h-36 sm:w-24">
                            <img
                              loading="lazy"
                              decoding="async"
                              src={posterSrc}
                              alt={movie.title}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-base font-bold text-text-main md:text-xl">
                              {movie.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-soft">
                              {releaseYear && (
                                <span className="inline-flex items-center gap-1">
                                  <Calendar size={13} />
                                  {releaseYear}
                                </span>
                              )}

                              {rating > 0 && (
                                <span className={`inline-flex items-center gap-1 font-semibold ${getMovieRatingColor(movie.rating || movie.vote_average)}`}>
                                  <Star size={13} fill="currentColor" />
                                  {rating.toFixed(1)}
                                </span>
                              )}

                              {badgeClass && (
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${badgeClass}`}>
                                  <TrendingUp size={11} />
                                  Popular
                                </span>
                              )}
                            </div>

                            {movie.overview && (
                              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-soft md:mt-3 md:text-sm">
                                {movie.overview}
                              </p>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {showCast && cast.length > 0 && (
              <PersonSection
                title="Cast"
                icon={<Users size={17} />}
                people={cast}
                navigate={navigate}
              />
            )}

            {showCrew && crew.length > 0 && (
              <PersonSection
                title="Crew"
                icon={<Clapperboard size={17} />}
                people={crew}
                navigate={navigate}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function PersonSection({ title, icon, people, navigate }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold text-text-main">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          {icon}
        </span>
        {title}
      </h2>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
        {people.map((person) => (
          <button
            key={`${title}-${person.id}`}
            type="button"
            onClick={() => navigate(`/person/${person.id}?role=${mapPersonRole(person)}`)}
            className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-surface/55 p-2 text-left transition hover:border-primary/35 hover:bg-surface/65 sm:block sm:p-3"
          >
            <img
              src={
                person.profile_path
                  ? `https://image.tmdb.org/t/p/w342${person.profile_path}`
                  : "/no-image.svg"
              }
              alt={person.name}
              loading="lazy"
              className="h-14 w-14 rounded-full object-cover sm:aspect-[2/3] sm:h-auto sm:w-full sm:rounded-xl"
            />
            <div className="min-w-0 sm:mt-2">
              <p className="line-clamp-1 text-sm font-semibold text-text-main">{person.name}</p>
              <p className="line-clamp-1 text-xs text-text-soft">{getProfessionLabel(person)}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

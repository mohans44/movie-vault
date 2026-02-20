import { useEffect, useState, useCallback } from "react";
import {
  getTopMoviesWorldwide,
  getTopMoviesIndia,
  getLatestMoviesWorldwide,
  getLatestMoviesIndia,
  getAwardWinningMovies,
  getRecommendedMovies,
} from "../utils/api";
import MovieCarousel from "../components/MovieCarousel";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, MapPin, Heart, Sparkles, Clapperboard, CalendarClock, Trophy } from "lucide-react";

function useMovieData(fetchFn, enabled = true) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFn();
      const movieData = result.results || result || [];

      setData(movieData);
    } catch (err) {
      setError(err.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      setError(null);
    }
  }, [enabled]);

  return { data, loading, error, refetch: fetchData };
}

function WelcomeHeader({ user }) {
  const hour = new Date().getHours();
  const displayName = user?.name?.trim() || "there";
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const timeLabel =
    hour < 12
      ? "Morning Picks"
      : hour < 17
        ? "Afternoon Picks"
        : hour < 22
          ? "Tonight's Picks"
          : "Late Night Picks";

  return (
    <header className="glass-panel mb-4 rounded-3xl border border-white/12 p-3.5 md:mb-7 md:p-5">
      <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        <Sparkles size={12} />
        {timeLabel}
      </p>

      <h1 className="font-display text-2xl font-bold leading-tight text-text-main md:text-4xl">
        {user ? `${greeting}, ${displayName}` : "Find your next favorite film"}
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-text-soft md:text-sm">
        Explore global trends, regional picks, and recommendation rails shaped by what you log.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-soft">
          Curated Discovery
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-soft">
          Fresh Releases
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-soft">
          Personalized Picks
        </span>
      </div>
    </header>
  );
}

export default function Home() {
  const { user } = useAuth();
  const recommendationsEnabled = Boolean(user?.username);

  const trendingFetch = useCallback(getTopMoviesWorldwide, []);
  const latestFetch = useCallback(getLatestMoviesWorldwide, []);
  const indianFetch = useCallback(getTopMoviesIndia, []);
  const latestIndiaFetch = useCallback(getLatestMoviesIndia, []);
  const awardWinningFetch = useCallback(getAwardWinningMovies, []);
  const recommendationsFetch = useCallback(
    () => getRecommendedMovies(user?.username),
    [user?.username]
  );

  const recommendationsData = useMovieData(
    recommendationsFetch,
    recommendationsEnabled
  );

  return (
    <div className="min-h-screen px-2.5 pb-10 pt-4 sm:px-6 md:pt-5">
      <main className="relative z-10 mx-auto w-full max-w-7xl">
        <WelcomeHeader user={user} />

        <MovieCarousel
          title="Trending Movies"
          icon={TrendingUp}
          fetchMovies={trendingFetch}
        />

        <MovieCarousel
          title="Latest Movies"
          icon={CalendarClock}
          fetchMovies={latestFetch}
        />

        <MovieCarousel
          title="Trending in India"
          icon={MapPin}
          fetchMovies={indianFetch}
        />

        <MovieCarousel
          title="Latest in India"
          icon={Clapperboard}
          fetchMovies={latestIndiaFetch}
        />

        {recommendationsEnabled && recommendationsData.data.length > 0 && (
          <MovieCarousel
            title="Recommended for You"
            icon={Heart}
            movies={recommendationsData.data}
            loading={recommendationsData.loading}
          />
        )}

        <MovieCarousel
          title="Award Winning Movies"
          icon={Trophy}
          fetchMovies={awardWinningFetch}
        />

        {recommendationsEnabled &&
          !recommendationsData.loading &&
          recommendationsData.data.length === 0 && (
            <section className="mb-8 rounded-2xl border border-white/10 bg-surface/35 p-4 text-sm text-text-soft">
              Keep rating and logging movies to unlock personalized recommendations.
            </section>
          )}

        {recommendationsData.error && recommendationsEnabled && (
          <p className="mt-2 text-xs text-text-soft">
            Recommendations are temporarily unavailable.
          </p>
        )}
      </main>
    </div>
  );
}

import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchMovieDetails, getWatchlist } from "../utils/api";
import { Bookmark } from "lucide-react";
import { MovieGridSection } from "../components/MovieGridSection";

export default function Watchlist() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setMovies([]);
    setLoading(true);
    getWatchlist(user.username)
      .then((movieIds) => Promise.all(movieIds.map((id) => fetchMovieDetails(id))))
      .then((results) => setMovies(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="px-4 py-12 text-center text-text-soft">
        Please log in to see your watchlist.
      </div>
    );
  }

  return (
    <MovieGridSection
      loading={loading}
      movies={movies}
      icon={<Bookmark size={18} />}
      title="Your Watchlist"
      loadingText="Loading your watchlist..."
      emptyText="Your watchlist is empty"
      emptySub="Add movies you want to see next."
      mobileDense={true}
      maxWidthClass="max-w-7xl"
    />
  );
}

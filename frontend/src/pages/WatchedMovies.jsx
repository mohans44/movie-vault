import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchMovieDetails, getLoggedMovies } from "../utils/api";
import { Popcorn } from "lucide-react";
import { MovieGridSection } from "../components/MovieGridSection";

export default function WatchedMovies() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setMovies([]);
    setLoading(true);
    getLoggedMovies(user.username)
      .then((movieIds) =>
        Promise.all([...movieIds].reverse().map((id) => fetchMovieDetails(id)))
      )
      .then((results) => setMovies(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="px-4 py-12 text-center text-text-soft">
        Please log in to see your watched movies.
      </div>
    );
  }

  return (
    <MovieGridSection
      loading={loading}
      movies={movies}
      icon={<Popcorn size={18} />}
      title="Watched Movies"
      loadingText="Counting your screenings..."
      emptyText="No movies watched yet"
      emptySub="Start logging your screenings."
      mobileDense={true}
      maxWidthClass="max-w-7xl"
    />
  );
}

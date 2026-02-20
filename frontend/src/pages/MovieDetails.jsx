import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { addToWatchlist, removeFromWatchlist } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useMovieData } from "../hooks/useMovieData";
import { MovieHero } from "../components/MovieHero";
import { CastSection } from "../components/CastSection";
import { CrewSection } from "../components/CrewSection";
import { ReviewsSection } from "../components/ReviewsSection";
import { RecommendationsSection } from "../components/RecommendationsSection";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { WhereToWatch } from "../components/WhereToWatch";
import LogMovieModal from "../components/LogMovieModal";

export default function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistFeedback, setWatchlistFeedback] = useState(null);

  const {
    movie,
    recommendations,
    reviews,
    tmdbReviews,
    watchlist,
    existingRating,
    watchProviders,
    watchProvidersRegion,
    loading,
    loadingRec,
    loadingReviews,
    loadingProviders,
    refreshUserLogAndReviews,
  } = useMovieData(id, user);

  const [localRating, setLocalRating] = useState(null);
  const [lastDeletedReviewUser, setLastDeletedReviewUser] = useState(null);
  const [optimisticWatchlistState, setOptimisticWatchlistState] = useState(null);

  useEffect(() => {
    setLocalRating(existingRating);
    setIsLogModalOpen(false);
    setLastDeletedReviewUser(null);
  }, [existingRating, id]);

  const isLogged = !!localRating;
  const serverWatchlistState = watchlist.some((m) => {
    const movieId = m.movie_id || m;
    return movieId == id || movieId == parseInt(id);
  });
  const isInWatchlist =
    optimisticWatchlistState === null ? serverWatchlistState : optimisticWatchlistState;

  useEffect(() => {
    setOptimisticWatchlistState(null);
    setWatchlistFeedback(null);
  }, [id, watchlist, user?.username]);

  const handleLogMovie = () => {
    if (!user) return alert("Please log in to rate movies");
    setIsLogModalOpen(true);
  };

  const handleLogSuccess = (action, newRating) => {
    if (action === "delete") {
      setLastDeletedReviewUser(user?.username);
      setLocalRating(null);
    } else if (action === "edit" || action === "add") {
      setLocalRating(newRating);
      setLastDeletedReviewUser(null);
    }
    refreshUserLogAndReviews();
  };

  const handleWatchlistAction = async () => {
    if (!user) return alert("Please log in to manage watchlist");
    if (watchlistLoading) return;

    const nextState = !isInWatchlist;
    setOptimisticWatchlistState(nextState);
    setWatchlistFeedback(null);
    setWatchlistLoading(true);
    try {
      if (nextState) {
        await addToWatchlist(user.username, movie.id);
        setWatchlistFeedback("added");
      } else {
        await removeFromWatchlist(user.username, movie.id);
        setWatchlistFeedback("removed");
      }
      refreshUserLogAndReviews();
      setTimeout(() => setWatchlistFeedback(null), 1200);
    } catch {
      setOptimisticWatchlistState(!nextState);
      setWatchlistFeedback(null);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  if (loading) return <LoadingSpinner message="Loading movie details..." />;

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-text-main mb-2">
            Movie Not Found
          </h2>
          <p className="text-text-soft">
            The movie you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-text-main">
      {movie.backdrop_path && (
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${movie.backdrop_path})` }}
          aria-hidden="true"
        />
      )}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_25%_12%,rgba(8,10,18,0.28),transparent_35%),linear-gradient(to_bottom,rgba(7,9,16,0.28),rgba(7,9,16,0.78)_40%,rgba(7,9,16,0.96)_70%,rgba(7,9,16,1)_100%)]" />

      <div className="relative z-10 pb-4">
        <MovieHero
          movie={movie}
          existingRating={localRating}
          isLogged={isLogged}
          isInWatchlist={isInWatchlist}
          onLogMovie={handleLogMovie}
          onWatchlistAction={handleWatchlistAction}
          onShare={handleShare}
          watchlistLoading={watchlistLoading}
          shareSuccess={shareSuccess}
          watchlistFeedback={watchlistFeedback}
        />
        <CastSection cast={movie?.cast || []} />
        <CrewSection crew={movie?.crew || []} />
        <WhereToWatch
          providers={watchProviders}
          region={watchProvidersRegion}
          loading={loadingProviders}
        />
        <ReviewsSection
          reviews={reviews}
          tmdbReviews={tmdbReviews}
          loading={loadingReviews}
          user={user}
          onLogMovie={handleLogMovie}
          userRating={localRating}
          lastDeletedReviewUser={lastDeletedReviewUser}
        />
        <RecommendationsSection
          recommendations={recommendations}
          loading={loadingRec}
        />
      </div>

      <LogMovieModal
        movie={movie}
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        existingRating={localRating}
        onSuccess={handleLogSuccess}
      />
    </div>
  );
}

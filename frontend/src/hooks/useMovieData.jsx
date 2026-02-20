import { useEffect, useState } from "react";
import {
  fetchMovieDetails,
  getMovieRecommendations,
  getMovieTmdbReviews,
  getMovieWatchProviders,
  getLoggedMovies,
  getWatchlist,
  getRatings,
} from "../utils/api";

export function useMovieData(id, user) {
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tmdbReviews, setTmdbReviews] = useState([]);
  const [loggedMovies, setLoggedMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [existingRating, setExistingRating] = useState(null);
  const [watchProviders, setWatchProviders] = useState([]);
  const [watchProvidersRegion, setWatchProvidersRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRec, setLoadingRec] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    setLoading(true);
    setMovie(null);
    fetchMovieDetails(id)
      .then(setMovie)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoadingRec(true);
    if (movie?.id) {
      getMovieRecommendations(movie.id)
        .then((data) =>
          setRecommendations(Array.isArray(data) ? data : data?.results || [])
        )
        .finally(() => setLoadingRec(false));
    } else {
      setRecommendations([]);
      setLoadingRec(false);
    }
  }, [movie]);

  useEffect(() => {
    setLoadingProviders(true);
    if (movie?.id) {
      getMovieWatchProviders(movie.id)
        .then((data) => {
          setWatchProviders(data.providers || []);
          setWatchProvidersRegion(data.region || null);
        })
        .finally(() => setLoadingProviders(false));
    } else {
      setWatchProviders([]);
      setWatchProvidersRegion(null);
      setLoadingProviders(false);
    }
  }, [movie]);

  useEffect(() => {
    setReviews([]);
    setTmdbReviews([]);
    setExistingRating(null);
    if (id) {
      setLoadingReviews(true);
      Promise.all([getRatings(id), getMovieTmdbReviews(id)])
        .then(([ratingsData, tmdbData]) => {
          const normalizedRatings = Array.isArray(ratingsData) ? ratingsData : [];
          const normalizedTmdb = Array.isArray(tmdbData)
            ? tmdbData.map((review) => ({
                id: review.id,
                username:
                  review.author_details?.username ||
                  review.author ||
                  "TMDB User",
                review: review.content || "",
                rating:
                  typeof review.author_details?.rating === "number"
                    ? review.author_details.rating / 2
                    : null,
                created_at: review.created_at,
                source: "tmdb",
                url: review.url || null,
              }))
            : [];

          setReviews(normalizedRatings);
          setTmdbReviews(normalizedTmdb);
          setExistingRating(
            normalizedRatings.find((r) => r.username === user?.username) || null
          );
        })
        .finally(() => setLoadingReviews(false));
    } else {
      setLoadingReviews(false);
    }
  }, [id, user?.username]);

  useEffect(() => {
    if (user?.username) {
      getLoggedMovies(user.username).then((movies) =>
        setLoggedMovies(movies || [])
      );
      getWatchlist(user.username).then((list) => setWatchlist(list || []));
    }
  }, [user?.username, id]);

  const refreshUserLogAndReviews = () => {
    if (id) {
      getRatings(id).then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setExistingRating(
          (data || []).find((r) => r.username === user?.username) || null
        );
      });
      getMovieTmdbReviews(id).then((tmdbData) => {
        const normalizedTmdb = Array.isArray(tmdbData)
          ? tmdbData.map((review) => ({
              id: review.id,
              username:
                review.author_details?.username ||
                review.author ||
                "TMDB User",
              review: review.content || "",
              rating:
                typeof review.author_details?.rating === "number"
                  ? review.author_details.rating / 2
                  : null,
              created_at: review.created_at,
              source: "tmdb",
              url: review.url || null,
            }))
          : [];
        setTmdbReviews(normalizedTmdb);
      });
    }
    if (user?.username) {
      getLoggedMovies(user.username).then((movies) => {
        setLoggedMovies(movies || []);
      });
      getWatchlist(user.username).then((list) => setWatchlist(list || []));
    }
  };

  return {
    movie,
    recommendations,
    reviews,
    tmdbReviews,
    loggedMovies,
    watchlist,
    existingRating,
    watchProviders,
    watchProvidersRegion,
    loading,
    loadingRec,
    loadingReviews,
    loadingProviders,
    refreshUserLogAndReviews,
  };
}

import { useEffect, useState } from "react";
import {
  fetchMovieDetails,
  getMovieRecommendations,
  getMovieWatchProviders,
  getLoggedMovies,
  getWatchlist,
  getRatings,
} from "../utils/api";

export function useMovieData(id, user) {
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
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
    setExistingRating(null);
    if (movie?.id) {
      setLoadingReviews(true);
      getRatings(movie.id)
        .then((data) => {
          setReviews(Array.isArray(data) ? data : []);
          setExistingRating(
            (data || []).find((r) => r.username === user?.username) || null
          );
        })
        .finally(() => setLoadingReviews(false));
    } else {
      setLoadingReviews(false);
    }
  }, [movie, user?.username]);

  useEffect(() => {
    if (user?.username) {
      getLoggedMovies(user.username).then((movies) =>
        setLoggedMovies(movies || [])
      );
      getWatchlist(user.username).then((list) => setWatchlist(list || []));
    }
  }, [user?.username, id]);

  const refreshUserLogAndReviews = () => {
    if (movie?.id) {
      getRatings(movie.id).then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setExistingRating(
          (data || []).find((r) => r.username === user?.username) || null
        );
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

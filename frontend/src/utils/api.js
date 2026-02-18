// api.js
import axios from "axios";

function resolveBaseUrl() {
  const configured =
    import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE_URL;

  if (typeof configured === "string" && configured.trim()) {
    return configured.trim().replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost") {
      return "http://localhost:8000";
    }

    // In deployed environments, default to same-origin to avoid localhost fallbacks.
    return window.location.origin.replace(/\/$/, "");
  }

  return "http://localhost:8000";
}

const BASE_URL = resolveBaseUrl();
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const API_CACHE_PREFIX = "mv_api_cache:";
const inFlightRequests = new Map();

const CACHE_TTL = {
  short: 60 * 1000,
  medium: 5 * 60 * 1000,
  long: 20 * 60 * 1000,
};

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function tmdbImage(path, size = "w500") {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

function toCacheKey(key) {
  return `${API_CACHE_PREFIX}${key}`;
}

function getCachedValue(key) {
  try {
    const raw = sessionStorage.getItem(toCacheKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.expiry || Date.now() > parsed.expiry) {
      sessionStorage.removeItem(toCacheKey(key));
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

function setCachedValue(key, value, ttlMs) {
  try {
    sessionStorage.setItem(
      toCacheKey(key),
      JSON.stringify({ value, expiry: Date.now() + ttlMs })
    );
  } catch {
    // Ignore storage quota issues.
  }
}

function invalidateCacheByPrefix(prefixes = []) {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (!key.startsWith(API_CACHE_PREFIX)) return;
      if (prefixes.some((prefix) => key.startsWith(toCacheKey(prefix)))) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore storage issues.
  }
}

async function withCache(key, fetcher, ttlMs = CACHE_TTL.medium) {
  const cached = getCachedValue(key);
  if (cached !== null) return cached;

  const inFlightKey = toCacheKey(key);
  if (inFlightRequests.has(inFlightKey)) {
    return inFlightRequests.get(inFlightKey);
  }

  const request = (async () => {
    const value = await fetcher();
    setCachedValue(key, value, ttlMs);
    return value;
  })().finally(() => {
    inFlightRequests.delete(inFlightKey);
  });

  inFlightRequests.set(inFlightKey, request);
  return request;
}

function getCrewPriority(role = "") {
  const value = role.toLowerCase();
  if (value === "director") return 0;
  if (value.includes("producer")) return 1;
  if (value.includes("music") || value.includes("composer")) return 2;
  if (value.includes("story")) return 3;
  if (value.includes("screenplay") || value.includes("writer")) return 4;
  if (value.includes("cinematography") || value.includes("director of photography")) return 5;
  if (value.includes("editor")) return 6;
  if (value.includes("production design")) return 7;
  if (value.includes("costume")) return 8;
  if (value.includes("sound")) return 9;
  if (value.includes("visual effects")) return 10;
  return 99;
}

function extractAuthError(error, fallback) {
  if (!error?.response) {
    return "Unable to reach server. Please check if backend is running.";
  }

  const status = error.response.status;
  const serverMessage = error.response?.data?.error;

  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage;
  }

  if (status === 400) return "Please fill all required fields.";
  if (status === 401) return "Invalid credentials.";
  if (status === 409) return "This account already exists.";
  if (status === 503) return "Service temporarily unavailable. Please try again shortly.";
  if (status >= 500) return "Server error. Please try again shortly.";

  return fallback;
}

// TMDB Proxy
export const fetchMovieDetails = async (id) => {
  return withCache(
    `movie:details:${id}`,
    async () => {
      const [detailsResponse, creditsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/movies/proxy/tmdb/movie/${id}`, {
          headers: getAuthHeaders(),
        }),
        axios.get(`${BASE_URL}/api/movies/proxy/tmdb/movie/${id}/credits`, {
          headers: getAuthHeaders(),
        }),
      ]);

      const movie = detailsResponse.data;
      const crewList = creditsResponse.data.crew || [];
      const castList = creditsResponse.data.cast || [];
      const director =
        crewList.find((member) => member.job === "Director")?.name || "N/A";

      const cast = castList.map((person) => ({
        id: person.id,
        name: person.name,
        character: person.character || "Unknown",
        profile_path: tmdbImage(person.profile_path, "w185"),
      }));

      const crew = crewList
        .filter(
          (person, index, arr) =>
            arr.findIndex((p) => p.id === person.id && p.job === person.job) ===
            index
        )
        .map((person) => ({
          id: person.id,
          name: person.name,
          role: person.job || person.department || "Crew",
          profile_path: tmdbImage(person.profile_path, "w185"),
        }))
        .sort((a, b) => {
          const priorityDelta = getCrewPriority(a.role) - getCrewPriority(b.role);
          if (priorityDelta !== 0) return priorityDelta;
          const hasPhotoDelta =
            Number(Boolean(b.profile_path)) - Number(Boolean(a.profile_path));
          if (hasPhotoDelta !== 0) return hasPhotoDelta;
          return (a.name || "").localeCompare(b.name || "");
        });

      return {
        id,
        title: movie.title,
        original_title: movie.original_title,
        overview: movie.overview,
        tagline: movie.tagline,
        poster_path: movie.poster_path
          ? tmdbImage(movie.poster_path, "w500")
          : null,
        backdrop_path: movie.backdrop_path
          ? tmdbImage(movie.backdrop_path, "w1280")
          : null,
        release_date: movie.release_date,
        genres: movie.genres || [],
        rating: movie.vote_average,
        vote_count: movie.vote_count || 0,
        runtime: movie.runtime,
        production_countries: movie.production_countries || [],
        spoken_languages: movie.spoken_languages || [],
        director,
        cast,
        crew,
      };
    },
    CACHE_TTL.long
  );
};

export const searchMovies = async (query) => {
  try {
    return withCache(
      `search:movie:${query.trim().toLowerCase()}`,
      async () => {
        const searchResponse = await axios.get(
          `${BASE_URL}/api/movies/proxy/tmdb/search/movie`,
          { params: { query }, headers: getAuthHeaders() }
        );
        return searchResponse.data.results || [];
      },
      CACHE_TTL.short
    );
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};

export const searchAll = async (query) => {
  try {
    return withCache(
      `search:all:${query.trim().toLowerCase()}`,
      async () => {
        const response = await axios.get(
          `${BASE_URL}/api/movies/proxy/tmdb/search/multi`,
          {
            params: { query, include_adult: false },
            headers: getAuthHeaders(),
          }
        );

        const results = response.data.results || [];
        const movies = results.filter((item) => item.media_type === "movie");
        const people = results.filter((item) => item.media_type === "person");
        const cast = people.filter((person) => person.known_for_department === "Acting");
        const crew = people.filter((person) => person.known_for_department !== "Acting");

        return { movies, cast, crew };
      },
      CACHE_TTL.short
    );
  } catch (error) {
    console.error("Error searching movies/cast/crew:", error);
    return { movies: [], cast: [], crew: [] };
  }
};

export const getTopMoviesWorldwide = async (page = 1) => {
  return withCache(
    `movies:trending:world:${page}`,
    async () => {
      const response = await axios.get(
        `${BASE_URL}/api/movies/proxy/tmdb/trending/movie/week`,
        { params: { page }, headers: getAuthHeaders() }
      );
      const results = (response.data.results || []).filter(
        (movie) => Number(movie.vote_average || movie.rating || 0) >= 2
      );
      const hasMore = results.length === 20;
      return { results, hasMore };
    },
    CACHE_TTL.short
  );
};

export const getTopMoviesIndia = async (page = 1) => {
  return withCache(
    `movies:trending:india:${page}`,
    async () => {
      const response = await axios.get(
        `${BASE_URL}/api/movies/proxy/tmdb/discover/movie`,
        {
          params: {
            region: "IN",
            with_origin_country: "IN",
            page,
          },
          headers: getAuthHeaders(),
        }
      );
      const results = (response.data.results || []).filter(
        (movie) => Number(movie.vote_average || movie.rating || 0) >= 2
      );
      const hasMore = results.length === 20;
      return { results, hasMore };
    },
    CACHE_TTL.short
  );
};

export const getLatestMoviesWorldwide = async (page = 1) => {
  return withCache(
    `movies:latest:world:${page}`,
    async () => {
      const response = await axios.get(
        `${BASE_URL}/api/movies/proxy/tmdb/movie/now_playing`,
        { params: { page }, headers: getAuthHeaders() }
      );
      const results = response.data.results || [];
      const hasMore = results.length === 20;
      return { results, hasMore };
    },
    CACHE_TTL.short
  );
};

export const getLatestMoviesIndia = async (page = 1) => {
  return withCache(
    `movies:latest:india:${page}`,
    async () => {
      const response = await axios.get(
        `${BASE_URL}/api/movies/proxy/tmdb/discover/movie`,
        {
          params: {
            with_origin_country: "IN",
            sort_by: "primary_release_date.desc",
            "vote_average.gte": 0.1,
            page,
          },
          headers: getAuthHeaders(),
        }
      );
      const results = response.data.results || [];
      const hasMore = results.length === 20;
      return { results, hasMore };
    },
    CACHE_TTL.short
  );
};

export const getAwardWinningMovies = async (page = 1) => {
  return withCache(
    `movies:awards:${page}`,
    async () => {
      const response = await axios.get(
        `${BASE_URL}/api/movies/proxy/tmdb/discover/movie`,
        {
          params: {
            sort_by: "vote_average.desc",
            "vote_count.gte": 2500,
            page,
          },
          headers: getAuthHeaders(),
        }
      );
      const results = response.data.results || [];
      const hasMore = results.length === 20;
      return { results, hasMore };
    },
    CACHE_TTL.short
  );
};

export const getMovieRecommendations = async (movieId) => {
  try {
    return withCache(
      `movie:recommendations:${movieId}`,
      async () => {
        const response = await axios.get(
          `${BASE_URL}/api/movies/proxy/tmdb/movie/${movieId}/recommendations`,
          { headers: getAuthHeaders() }
        );
        return response.data.results || [];
      },
      CACHE_TTL.medium
    );
  } catch (error) {
    console.error("Error fetching movie recommendations:", error);
    return [];
  }
};

export const getMovieWatchProviders = async (movieId) => {
  try {
    return withCache(
      `movie:providers:${movieId}`,
      async () => {
        const response = await axios.get(
          `${BASE_URL}/api/movies/proxy/tmdb/movie/${movieId}/watch/providers`,
          { headers: getAuthHeaders() }
        );
        const results = response.data?.results || {};
        const regionOrder = ["IN", "US"];
        const regionKey =
          regionOrder.find((region) => results[region]) ||
          Object.keys(results)[0];

        if (!regionKey) return { region: null, providers: [] };

        const regionData = results[regionKey] || {};
        const mergeWithTag = (items = [], tag) =>
          items.map((provider) => ({ ...provider, tag }));
        const merged = [
          ...mergeWithTag(regionData.flatrate, "Stream"),
          ...mergeWithTag(regionData.rent, "Rent"),
          ...mergeWithTag(regionData.buy, "Buy"),
        ];
        const deduped = merged.reduce((acc, provider) => {
          const existing = acc.find((item) => item.provider_id === provider.provider_id);
          if (!existing) {
            acc.push({ ...provider, tags: [provider.tag] });
          } else if (!existing.tags.includes(provider.tag)) {
            existing.tags.push(provider.tag);
          }
          return acc;
        }, []);

        return {
          region: regionKey,
          providers: deduped.map((provider) => ({
            id: provider.provider_id,
            name: provider.provider_name,
            tags: provider.tags || [],
            logo: provider.logo_path
              ? `${TMDB_IMAGE_BASE}/w92${provider.logo_path}`
              : null,
          })),
        };
      },
      CACHE_TTL.medium
    );
  } catch (error) {
    console.error("Error fetching watch providers:", error);
    return { region: null, providers: [] };
  }
};
// USER MOVIE LISTS

export const addToWatchlist = async (username, movieId) => {
  try {
    await axios.post(
      `${BASE_URL}/api/user/add-to-watchlist`,
      { username, movie_id: movieId },
      { headers: getAuthHeaders() }
    );
    invalidateCacheByPrefix([
      `user:watchlist:${username}`,
      `user:recommendations:${username}`,
    ]);
    return true;
  } catch {
    return false;
  }
};

export const removeFromWatchlist = async (username, movieId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/user/remove-from-watchlist`,
      { username, movie_id: movieId },
      { headers: getAuthHeaders() }
    );
    invalidateCacheByPrefix([
      `user:watchlist:${username}`,
      `user:recommendations:${username}`,
    ]);
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.error || "An error occurred" };
  }
};

export const getLoggedMovies = async (username) => {
  try {
    return withCache(
      `user:logged:${username}`,
      async () => {
        const response = await axios.get(`${BASE_URL}/api/user/get-logged`, {
          params: { username },
          headers: getAuthHeaders(),
        });
        return response.data.logged || [];
      },
      CACHE_TTL.short
    );
  } catch {
    return [];
  }
};

export const getWatchlist = async (username) => {
  try {
    return withCache(
      `user:watchlist:${username}`,
      async () => {
        const response = await axios.get(`${BASE_URL}/api/user/get-watchlist`, {
          params: { username },
          headers: getAuthHeaders(),
        });
        return response.data.watchlist || [];
      },
      CACHE_TTL.short
    );
  } catch {
    return [];
  }
};

export const getRecommendedMovies = async (username) => {
  try {
    return withCache(
      `user:recommendations:${username}`,
      async () => {
        const response = await axios.post(
          `${BASE_URL}/api/user/recommended-movies`,
          { username },
          { headers: getAuthHeaders() }
        );
        return response.data?.recommendations || [];
      },
      CACHE_TTL.medium
    );
  } catch (error) {
    console.error("Error fetching recommended movies:", error.message);
    return [];
  }
};

// AUTH

export const signupUser = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, data);
    return response.data;
  } catch (error) {
    throw new Error(extractAuthError(error, "Signup failed. Please try again."));
  }
};

export const loginUser = async (user, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      user,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractAuthError(error, "Login failed. Please try again."));
  }
};

export const updateUserProfile = async (payload) => {
  try {
    const previousUserRaw = localStorage.getItem("user");
    const previousUsername = previousUserRaw
      ? JSON.parse(previousUserRaw)?.username
      : null;
    const response = await axios.put(`${BASE_URL}/api/user/profile`, payload, {
      headers: getAuthHeaders(),
    });
    if (previousUsername) {
      invalidateCacheByPrefix([
        `user:logged:${previousUsername}`,
        `user:watchlist:${previousUsername}`,
        `user:recommendations:${previousUsername}`,
      ]);
    }
    if (response?.data?.user?.username) {
      invalidateCacheByPrefix([
        `user:logged:${response.data.user.username}`,
        `user:watchlist:${response.data.user.username}`,
        `user:recommendations:${response.data.user.username}`,
      ]);
    }
    return response.data;
  } catch (error) {
    throw new Error(extractAuthError(error, "Failed to update profile."));
  }
};

// RATINGS

export const addRating = async (
  username,
  movieId,
  rating,
  review = "",
  watchedDate
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/ratings/add-rating`,
      {
        username,
        movie_id: movieId,
        rating,
        review,
        watched_date: watchedDate,
      },
      { headers: getAuthHeaders() }
    );
    invalidateCacheByPrefix([
      `ratings:${movieId}`,
      `user:logged:${username}`,
      `user:watchlist:${username}`,
      `user:recommendations:${username}`,
    ]);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to add rating";
  }
};

export const editRating = async (username, movieId, rating, review = "") => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/ratings/edit-rating`,
      { username, movie_id: movieId, rating, review },
      { headers: getAuthHeaders() }
    );
    invalidateCacheByPrefix([
      `ratings:${movieId}`,
      `user:logged:${username}`,
      `user:recommendations:${username}`,
    ]);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to edit rating";
  }
};

export const deleteRating = async (username, movieId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/ratings/delete-rating`,
      {
        data: { username, movie_id: movieId },
        headers: getAuthHeaders(),
      }
    );
    invalidateCacheByPrefix([
      `ratings:${movieId}`,
      `user:logged:${username}`,
      `user:recommendations:${username}`,
    ]);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to delete rating";
  }
};

export const getRatings = async (movieId) => {
  try {
    return withCache(
      `ratings:${movieId}`,
      async () => {
        const response = await axios.get(
          `${BASE_URL}/api/ratings/get-ratings/${movieId}`,
          {
            headers: getAuthHeaders(),
          }
        );

        return response.data;
      },
      CACHE_TTL.short
    );
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch ratings";
  }
};

export const fetchPersonDetails = async (personId) => {
  return withCache(
    `person:details:${personId}`,
    async () => {
      const response = await axios.get(
        `${BASE_URL}/api/movies/proxy/tmdb/person/${personId}`,
        { headers: getAuthHeaders() }
      );

      const person = response.data;
      return {
        id: person.id,
        name: person.name,
        biography: person.biography || "No biography available.",
        birthday: person.birthday,
        place_of_birth: person.place_of_birth,
        known_for_department: person.known_for_department,
        profile_path: tmdbImage(person.profile_path, "w500"),
      };
    },
    CACHE_TTL.long
  );
};

export const fetchPersonCredits = async (personId) => {
  return withCache(
    `person:credits:${personId}`,
    async () => {
      const response = await axios.get(
        `${BASE_URL}/api/movies/proxy/tmdb/person/${personId}/combined_credits`,
        { headers: getAuthHeaders() }
      );

      const cast = (response.data.cast || [])
        .filter((item) => item.media_type === "movie")
        .map((item) => ({
          id: item.id,
          title: item.title || "Untitled",
          poster_path: item.poster_path,
          release_date: item.release_date || "",
          vote_average: item.vote_average || 0,
          media_type: item.media_type,
          role: item.character || "Actor",
        }));

      const crew = (response.data.crew || [])
        .filter((item) => item.media_type === "movie")
        .map((item) => ({
          id: item.id,
          title: item.title || "Untitled",
          poster_path: item.poster_path,
          release_date: item.release_date || "",
          vote_average: item.vote_average || 0,
          media_type: item.media_type,
          role: item.job || item.department || "Crew",
          department: item.department || "Crew",
        }));

      return { cast, crew };
    },
    CACHE_TTL.long
  );
};

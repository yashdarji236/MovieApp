import axios from "axios";

const TMDB_KEY  = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export const IMG_ORIGINAL     = "https://image.tmdb.org/t/p/original";
export const IMG_W500         = "https://image.tmdb.org/t/p/w500";
export const IMG_W300         = "https://image.tmdb.org/t/p/w300";
export const FALLBACK_POSTER   = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%232a1010'/%3E%3Crect x='120' y='160' width='60' height='60' rx='8' fill='none' stroke='%23f20d18' stroke-width='3' opacity='0.4'/%3E%3Cpolygon points='135,178 135,202 159,190' fill='%23f20d18' opacity='0.4'/%3E%3Ctext x='150' y='250' font-family='Arial' font-size='13' fill='%23f20d18' opacity='0.5' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
export const FALLBACK_BACKDROP = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720' viewBox='0 0 1280 720'%3E%3Crect width='1280' height='720' fill='%231a0808'/%3E%3Crect x='560' y='290' width='160' height='140' rx='12' fill='none' stroke='%23f20d18' stroke-width='4' opacity='0.3'/%3E%3Cpolygon points='600,330 600,400 660,365' fill='%23f20d18' opacity='0.3'/%3E%3Ctext x='640' y='470' font-family='Arial' font-size='24' fill='%23f20d18' opacity='0.4' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

const tmdb = axios.create({
  baseURL: TMDB_BASE,
  params:  { api_key: TMDB_KEY, language: "en-US" },
});

// ─── Movies ───────────────────────────────────────────────────
export const getTrending          = (type = "all", time = "week") => tmdb.get(`/trending/${type}/${time}`);
export const getPopularMovies     = (page = 1) => tmdb.get("/movie/popular",     { params: { page } });
export const getTopRatedMovies    = (page = 1) => tmdb.get("/movie/top_rated",   { params: { page } });
export const getNowPlayingMovies  = (page = 1) => tmdb.get("/movie/now_playing", { params: { page } });
export const getUpcomingMovies    = (page = 1) => tmdb.get("/movie/upcoming",    { params: { page } });
export const getMovieDetails      = (id)       => tmdb.get(`/movie/${id}`);
export const getMovieVideos       = (id)       => tmdb.get(`/movie/${id}/videos`);
export const getMovieCredits      = (id)       => tmdb.get(`/movie/${id}/credits`);
export const getSimilarMovies     = (id)       => tmdb.get(`/movie/${id}/similar`);
export const getMoviesByGenre     = (genreId, page = 1) =>
  tmdb.get("/discover/movie", { params: { with_genres: genreId, page, sort_by: "popularity.desc" } });

// ─── TV Shows ─────────────────────────────────────────────────
export const getPopularTV         = (page = 1) => tmdb.get("/tv/popular",      { params: { page } });
export const getTopRatedTV        = (page = 1) => tmdb.get("/tv/top_rated",    { params: { page } });
export const getNowPlayingTV      = (page = 1) => tmdb.get("/tv/airing_today", { params: { page } });
export const getUpcomingTV        = (page = 1) => tmdb.get("/tv/on_the_air",   { params: { page } });
export const getTVDetails         = (id)       => tmdb.get(`/tv/${id}`);
export const getTVVideos          = (id)       => tmdb.get(`/tv/${id}/videos`);
export const getTVCredits         = (id)       => tmdb.get(`/tv/${id}/credits`);
export const getSimilarTV         = (id)       => tmdb.get(`/tv/${id}/similar`);
export const getTVByGenre         = (genreId, page = 1) =>
  tmdb.get("/discover/tv", { params: { with_genres: genreId, page, sort_by: "popularity.desc" } });

// ─── Search ───────────────────────────────────────────────────
export const searchMulti  = (query, page = 1) => tmdb.get("/search/multi", { params: { query, page } });
export const searchMovies = (query, page = 1) => tmdb.get("/search/movie", { params: { query, page } });
export const searchTV     = (query, page = 1) => tmdb.get("/search/tv",    { params: { query, page } });

// ─── Genres ───────────────────────────────────────────────────
export const getMovieGenres = () => tmdb.get("/genre/movie/list");
export const getTVGenres    = () => tmdb.get("/genre/tv/list");

// ─── People ───────────────────────────────────────────────────
export const getPersonDetails = (id) => tmdb.get(`/person/${id}`);
export const getPersonMovies  = (id) => tmdb.get(`/person/${id}/movie_credits`);

// ─── Helpers ──────────────────────────────────────────────────
export const getTrailerKey = (data) => {
  const results = data?.results || [];
  const trailer = results.find(v => v.type === "Trailer" && v.site === "YouTube");
  return trailer?.key || results[0]?.key || null;
};

export const getImageURL = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : FALLBACK_POSTER;

export const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getTrending, getPopularMovies, getTopRatedMovies,
  getPopularTV, getMovieVideos, getTrailerKey,
  IMG_ORIGINAL, IMG_W500, FALLBACK_POSTER, FALLBACK_BACKDROP,
} from "../services/tmdb";

// ─── Skeleton Card ─────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{
    minWidth: "160px", height: "240px", borderRadius: "12px", flexShrink: 0,
    background: "linear-gradient(90deg,#2a1010 25%,#3d1515 50%,#2a1010 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
  }} />
);

// ─── Movie Card ────────────────────────────────────────────────
const MovieCard = ({ movie }) => {
  const [hovered, setHovered] = useState(false);
  const title  = movie.title || movie.name || "Unknown";
  const poster = movie.poster_path ? `${IMG_W500}${movie.poster_path}` : FALLBACK_POSTER;
  const rating = movie.vote_average?.toFixed(1);
  const year   = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const type   = movie.media_type === "tv" || movie.first_air_date ? "tv" : "movie";

  return (
    <Link to={`/${type}/${movie.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          minWidth: "160px", width: "160px", borderRadius: "12px",
          overflow: "hidden", cursor: "pointer", position: "relative",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          boxShadow: hovered ? "0 12px 40px rgba(242,13,24,0.35)" : "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <img src={poster} alt={title}
          style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }}
          onError={e => e.target.src = FALLBACK_POSTER}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top,rgba(34,16,17,0.98) 0%,rgba(34,16,17,0.2) 50%,transparent 100%)",
        }} />
        {rating && (
          <div style={{
            position: "absolute", top: "8px", right: "8px",
            backgroundColor: "rgba(242,13,24,0.9)", color: "white",
            fontSize: "11px", fontWeight: "700", padding: "3px 7px", borderRadius: "6px",
          }}>⭐ {rating}</div>
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 10px 12px" }}>
          <p style={{
            color: "white", fontSize: "13px", fontWeight: "600", lineHeight: "1.3",
            marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{title}</p>
          {year && <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>{year}</p>}
        </div>
      </div>
    </Link>
  );
};

// ─── Movie Row ─────────────────────────────────────────────────
const MovieRow = ({ title, movies, loading, viewAllLink }) => {
  const rowRef = useRef(null);
  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  return (
    <div style={{ marginBottom: "48px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", padding: "0 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "4px", height: "24px", backgroundColor: "#f20d18", borderRadius: "2px" }} />
          <h2 style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>{title}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {viewAllLink && (
            <Link to={viewAllLink} style={{ color: "#f20d18", fontSize: "13px", fontWeight: "600", textDecoration: "none", marginRight: "8px" }}>
              View All
            </Link>
          )}
        </div>
      </div>
      <div ref={rowRef} style={{ display: "flex", gap: "12px", overflowX: "auto", padding: "8px 40px 16px", scrollbarWidth: "none" }}>
        {loading
          ? Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : movies.map(m => <MovieCard key={m.id} movie={m} />)
        }
      </div>
    </div>
  );
};

// ─── Hero Banner ───────────────────────────────────────────────
const HeroBanner = ({ movies }) => {
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [animating,   setAnimating]   = useState(false);
  const [trailerKey,  setTrailerKey]  = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [paused,      setPaused]      = useState(false);
  const intervalRef   = useRef(null);
  const touchStartX   = useRef(null);
  const touchStartY   = useRef(null);

  const movie = movies[currentIdx];

  // ── Go to specific slide ────────────────────────────────────
  const goTo = useCallback((idx) => {
    if (animating || idx === currentIdx || movies.length === 0) return;
    setAnimating(true);
    setCurrentIdx(idx);
    setTimeout(() => setAnimating(false), 600);
  }, [animating, currentIdx, movies.length]);

  // ── Go to next slide ────────────────────────────────────────
  const goToNext = useCallback(() => {
    if (movies.length === 0) return;
    setAnimating(true);
    setCurrentIdx(prev => (prev + 1) % movies.length);
    setTimeout(() => setAnimating(false), 600);
  }, [movies.length]);

  // ── Auto-rotate every 3 seconds ────────────────────────────
  useEffect(() => {
    if (movies.length === 0 || paused) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(goToNext, 3000);
    return () => clearInterval(intervalRef.current);
  }, [movies.length, paused, goToNext]);

  // ── Fetch trailer for current movie ────────────────────────
  useEffect(() => {
    if (!movie) return;
    setTrailerKey(null);
    getMovieVideos(movie.id).then(res => {
      setTrailerKey(getTrailerKey(res.data));
    }).catch(() => {});
  }, [movie?.id]);

  // ── Touch swipe support (mobile) ───────────────────────────
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setPaused(true);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

    // Only swipe if mostly horizontal (not scrolling)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
      if (deltaX < 0) {
        // Swipe left → next
        goToNext();
      } else {
        // Swipe right → prev
        const prev = (currentIdx - 1 + movies.length) % movies.length;
        goTo(prev);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    setPaused(false);
  };

  if (!movie) return (
    <div style={{
      height: "85vh", backgroundColor: "#1a0808",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: "48px", height: "48px", border: "3px solid #f20d18",
        borderTopColor: "transparent", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );

  const backdrop = movie.backdrop_path ? `${IMG_ORIGINAL}${movie.backdrop_path}` : FALLBACK_BACKDROP;
  const title    = movie.title || movie.name;
  const overview = movie.overview || "";
  const rating   = movie.vote_average?.toFixed(1);
  const year     = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const type     = movie.media_type === "tv" || movie.first_air_date ? "tv" : "movie";

  return (
    <div
      style={{ position: "relative", height: "88vh", overflow: "hidden", cursor: "grab" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Backdrop images (crossfade via key) ── */}
      {movies.slice(0, 10).map((m, i) => (
        <img
          key={m.id}
          src={m.backdrop_path ? `${IMG_ORIGINAL}${m.backdrop_path}` : FALLBACK_BACKDROP}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "top",
            opacity: i === currentIdx ? 1 : 0,
            transition: "opacity 0.8s ease",
            zIndex: i === currentIdx ? 2 : 1,
          }}
        />
      ))}

      {/* ── Overlays ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        background: "linear-gradient(to right, rgba(34,16,17,0.97) 35%, rgba(34,16,17,0.5) 65%, rgba(34,16,17,0.15) 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        background: "linear-gradient(to top, #221011 0%, transparent 50%)",
      }} />

      {/* ── Content ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 5,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "0 40px", maxWidth: "700px",
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(10px)" : "translateY(0)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        {/* Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          <span style={{
            backgroundColor: "#f20d18", color: "white",
            fontSize: "11px", fontWeight: "700", padding: "4px 10px",
            borderRadius: "6px", letterSpacing: "1px", textTransform: "uppercase",
          }}>🔥 Trending #{currentIdx + 1}</span>
          {rating && (
            <span style={{
              backgroundColor: "rgba(255,255,255,0.1)", color: "white",
              fontSize: "12px", fontWeight: "600", padding: "4px 10px",
              borderRadius: "6px", backdropFilter: "blur(8px)",
            }}>⭐ {rating}</span>
          )}
          {year && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{year}</span>}
        </div>

        {/* Title */}
        <h1 style={{
          color: "white", fontSize: "clamp(26px,5vw,60px)",
          fontWeight: "900", lineHeight: "1.1", marginBottom: "12px",
          letterSpacing: "-0.5px", textShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}>{title}</h1>

        {/* Overview */}
        <p style={{
          color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: "1.7",
          marginBottom: "28px", maxWidth: "520px",
          display: "-webkit-box", WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{overview}</p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {trailerKey && (
            <button onClick={() => setShowTrailer(true)} style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "#f20d18", color: "white", border: "none",
              borderRadius: "12px", padding: "13px 26px", fontSize: "15px", fontWeight: "700",
              cursor: "pointer", fontFamily: "Inter, sans-serif",
              boxShadow: "0 6px 24px rgba(242,13,24,0.4)",
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#d10b15"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f20d18"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>play_arrow</span>
              Watch Trailer
            </button>
          )}
          <Link to={`/${type}/${movie.id}`} style={{
            display: "flex", alignItems: "center", gap: "8px",
            backgroundColor: "rgba(255,255,255,0.1)", color: "white",
            borderRadius: "12px", padding: "13px 26px",
            fontSize: "15px", fontWeight: "700", textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>info</span>
            More Info
          </Link>
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div style={{
        position: "absolute", bottom: "28px", left: "50%",
        transform: "translateX(-50%)", zIndex: 10,
        display: "flex", gap: "8px", alignItems: "center",
      }}>
        {movies.slice(0, 10).map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === currentIdx ? "28px" : "8px",
            height: "8px", borderRadius: "4px", border: "none",
            cursor: "pointer", padding: 0,
            backgroundColor: i === currentIdx ? "#f20d18" : "rgba(255,255,255,0.3)",
            transition: "all 0.35s ease",
          }} />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "3px", backgroundColor: "rgba(255,255,255,0.08)", zIndex: 10,
      }}>
        {!paused && (
          <div
            key={`${currentIdx}-progress`}
            style={{
              height: "100%", backgroundColor: "#f20d18",
              animation: "progress 3s linear forwards",
            }}
          />
        )}
      </div>

      {/* ── Trailer Modal ── */}
      {showTrailer && trailerKey && (
        <div onClick={() => setShowTrailer(false)} style={{
          position: "fixed", inset: 0, zIndex: 100,
          backgroundColor: "rgba(0,0,0,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "90%", maxWidth: "900px" }}>
            <button onClick={() => setShowTrailer(false)} style={{
              position: "absolute", top: "-44px", right: "0",
              background: "none", border: "none", color: "white", fontSize: "28px", cursor: "pointer",
            }}>✕</button>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "16px", overflow: "hidden" }}>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Trailer" allow="autoplay; encrypted-media" allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── HOME PAGE ─────────────────────────────────────────────────
export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popular,  setPopular]  = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [tvShows,  setTvShows]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [trendRes, popRes, topRes, tvRes] = await Promise.all([
          getTrending("all", "week"),
          getPopularMovies(),
          getTopRatedMovies(),
          getPopularTV(),
        ]);
        setTrending(trendRes.data.results || []);
        setPopular(popRes.data.results   || []);
        setTopRated(topRes.data.results  || []);
        setTvShows(tvRes.data.results    || []);
      } catch (err) {
        console.error("Home fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#221011", fontFamily: "Inter, sans-serif" }}>
      <HeroBanner movies={trending.slice(0, 10)} />
      <div style={{ paddingTop: "8px", paddingBottom: "60px" }}>
        <MovieRow title="🔥 Trending This Week" movies={trending} loading={loading} viewAllLink="/movies" />
        <MovieRow title="🎬 Popular Movies"     movies={popular}  loading={loading} viewAllLink="/movies" />
        <MovieRow title="⭐ Top Rated"          movies={topRated} loading={loading} viewAllLink="/movies" />
        <MovieRow title="📺 Popular TV Shows"   movies={tvShows}  loading={loading} viewAllLink="/tv"     />
      </div>

      <style>{`
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes progress { 0%{width:0%} 100%{width:100%} }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
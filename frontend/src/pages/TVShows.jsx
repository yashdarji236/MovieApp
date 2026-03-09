import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getTVByGenre, getTVGenres,
  IMG_W500, FALLBACK_POSTER,
} from "../services/tmdb";

// ─── TV Card ───────────────────────────────────────────────────
const TVCard = ({ show }) => {
  const [hovered, setHovered] = useState(false);
  const title  = show.name || show.title || "Unknown";
  const poster = show.poster_path ? `${IMG_W500}${show.poster_path}` : FALLBACK_POSTER;
  const rating = show.vote_average?.toFixed(1);
  const year   = (show.first_air_date || "").slice(0, 4);

  return (
    <Link to={`/tv/${show.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "150px", borderRadius: "12px", overflow: "hidden",
          cursor: "pointer", position: "relative",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "all 0.3s ease",
          boxShadow: hovered
            ? "0 16px 40px rgba(242,13,24,0.4)"
            : "0 4px 16px rgba(0,0,0,0.4)",
          backgroundColor: "#2a1010",
        }}
      >
        <img
          src={poster} alt={title}
          style={{ width: "150px", height: "225px", objectFit: "cover", display: "block" }}
          onError={e => e.target.src = FALLBACK_POSTER}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top,rgba(34,16,17,0.98) 0%,rgba(34,16,17,0.1) 55%,transparent 100%)",
        }} />
        {rating && (
          <div style={{
            position: "absolute", top: "8px", right: "8px",
            backgroundColor: "rgba(242,13,24,0.92)", color: "white",
            fontSize: "10px", fontWeight: "700", padding: "3px 7px", borderRadius: "6px",
          }}>⭐ {rating}</div>
        )}
        {/* TV badge */}
        <div style={{
          position: "absolute", top: "8px", left: "8px",
          backgroundColor: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.8)",
          fontSize: "9px", fontWeight: "700", padding: "2px 6px",
          borderRadius: "4px", letterSpacing: "0.5px",
        }}>TV</div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 12px" }}>
          <p style={{
            color: "white", fontSize: "12px", fontWeight: "700", marginBottom: "2px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{title}</p>
          {year && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>{year}</p>}
        </div>

        {hovered && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(242,13,24,0.1)",
          }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "50%",
              backgroundColor: "#f20d18",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(242,13,24,0.6)",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "white" }}>
                play_arrow
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

// ─── Skeleton Card ─────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{
    width: "150px", height: "225px", borderRadius: "12px", flexShrink: 0,
    background: "linear-gradient(90deg,#2a1010 25%,#3d1515 50%,#2a1010 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
  }} />
);

// ─── Genre Section ─────────────────────────────────────────────
const GenreSection = ({ genre }) => {
  const [shows,       setShows]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getTVByGenre(genre.id, 1)
      .then(res => {
        setShows(res.data.results || []);
        setTotalPages(Math.min(res.data.total_pages || 1, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [genre.id]);

  const handleShowMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await getTVByGenre(genre.id, nextPage);
      setShows(prev => [...prev, ...(res.data.results || [])]);
      setPage(nextPage);
    } catch {}
    finally { setLoadingMore(false); }
  };

  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  return (
    <div style={{ marginBottom: "48px" }}>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "16px", padding: "0 40px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "4px", height: "22px", backgroundColor: "#f20d18", borderRadius: "2px" }} />
          <h2 style={{ color: "white", fontSize: "19px", fontWeight: "700" }}>{genre.name}</h2>
          <span style={{
            backgroundColor: "rgba(242,13,24,0.12)",
            border: "1px solid rgba(242,13,24,0.25)",
            color: "#fca5a5", fontSize: "11px", fontWeight: "600",
            padding: "2px 10px", borderRadius: "20px",
          }}>{shows.length} shows</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Show More */}
          {page < totalPages && (
            <button
              onClick={handleShowMore}
              disabled={loadingMore}
              style={{
                padding: "6px 14px", borderRadius: "20px",
                backgroundColor: "transparent",
                border: "1px solid rgba(242,13,24,0.4)",
                color: "#f20d18", fontSize: "12px", fontWeight: "600",
                cursor: loadingMore ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif", transition: "all 0.2s",
                marginRight: "6px", display: "flex", alignItems: "center", gap: "5px",
                opacity: loadingMore ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!loadingMore) { e.currentTarget.style.backgroundColor = "#f20d18"; e.currentTarget.style.color = "white"; }}}
              onMouseLeave={e => { if (!loadingMore) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#f20d18"; }}}
            >
              {loadingMore ? (
                <svg style={{ animation: "spin 0.8s linear infinite", width: "13px", height: "13px" }} viewBox="0 0 24 24" fill="none">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>add</span>
              )}
              More
            </button>
          )}
          {/* Scroll arrows */}
        </div>
      </div>

      {/* Scroll row */}
      <div
        ref={rowRef}
        style={{
          display: "flex", gap: "12px",
          overflowX: "auto", padding: "4px 40px 16px",
          scrollbarWidth: "none",
        }}
      >
        {loading
          ? Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : shows.map(s => <TVCard key={s.id} show={s} />)
        }
        {loadingMore && Array(5).fill(0).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
      </div>
    </div>
  );
};

// ─── TV SHOWS PAGE ─────────────────────────────────────────────
export default function TVShows() {
  const [genres,        setGenres]        = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    getTVGenres()
      .then(res => setGenres(res.data.genres || []))
      .catch(() => {})
      .finally(() => setLoadingGenres(false));
  }, []);

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#221011",
      fontFamily: "Inter, sans-serif", paddingTop: "64px",
    }}>

      {/* ── Page Header ── */}
      <div style={{ padding: "36px 40px 32px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{ width: "5px", height: "36px", backgroundColor: "#f20d18", borderRadius: "3px" }} />
          <h1 style={{ color: "white", fontSize: "36px", fontWeight: "900", letterSpacing: "-0.5px" }}>
            TV Shows
          </h1>
          <span style={{
            backgroundColor: "rgba(242,13,24,0.1)",
            border: "1px solid rgba(242,13,24,0.2)",
            color: "#f20d18", fontSize: "13px", fontWeight: "700",
            padding: "4px 14px", borderRadius: "20px",
          }}>📺 Series</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", paddingLeft: "17px" }}>
          Browse TV shows by genre — click{" "}
          <span style={{ color: "#f20d18", fontWeight: "600" }}>More</span>{" "}
          to load more, click any show to view details
        </p>
      </div>

      {/* ── Genre Sections ── */}
      {loadingGenres ? (
        <div style={{ padding: "0 40px" }}>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} style={{ marginBottom: "48px" }}>
              <div style={{
                width: "200px", height: "22px", borderRadius: "6px",
                marginBottom: "16px", marginLeft: "40px",
                background: "linear-gradient(90deg,#2a1010 25%,#3d1515 50%,#2a1010 75%)",
                backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
              }} />
              <div style={{ display: "flex", gap: "12px", padding: "0 40px" }}>
                {Array(8).fill(0).map((_, j) => <SkeletonCard key={j} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        genres.map(genre => (
          <GenreSection key={genre.id} genre={genre} />
        ))
      )}

      <div style={{ height: "40px" }} />

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        *::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }

        @media (max-width: 768px) {
          div[style*="padding: 36px 40px"] { padding: 24px 16px 20px !important; }
          div[style*="padding: 4px 40px 16px"] { padding: 4px 16px 12px !important; }
          div[style*="padding: 0 40px"] { padding: 0 16px !important; }
          div[style*="marginBottom: 16px"] { padding: 0 16px !important; }
        }
      `}</style>
    </div>
  );
}
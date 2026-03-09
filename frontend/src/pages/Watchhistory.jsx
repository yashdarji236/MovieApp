import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FALLBACK_POSTER } from "../services/tmdb";

const BACKEND = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}`

// ─── Time helper ───────────────────────────────────────────────
function getTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)      return "Just now";
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)  return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Skeleton Card ─────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ borderRadius: "14px", overflow: "hidden", backgroundColor: "#2a1010" }}>
    <div style={{
      paddingBottom: "150%",
      background: "linear-gradient(90deg,#2a1010 25%,#3d1515 50%,#2a1010 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
    }} />
    <div style={{ padding: "12px" }}>
      <div style={{ height: "13px", borderRadius: "4px", marginBottom: "7px", background: "linear-gradient(90deg,#2a1010 25%,#3d1515 50%,#2a1010 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ height: "11px", width: "55%", borderRadius: "4px", background: "linear-gradient(90deg,#2a1010 25%,#3d1515 50%,#2a1010 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
    </div>
  </div>
);

// ─── History Card (same as FavCard + time badge) ───────────────
const HistCard = ({ item, onRemove }) => {
  const [hov,      setHov]      = useState(false);
  const [removing, setRemoving] = useState(false);
  const type    = item.mediaType || "movie";
  const title   = item.title    || "Unknown";
  const poster  = item.poster   || FALLBACK_POSTER;
  const timeAgo = item.watchedAt ? getTimeAgo(item.watchedAt) : "";

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    await onRemove(item.movieId);
    setRemoving(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <Link to={`/${type}/${item.movieId}`} style={{ textDecoration: "none" }}>
        <div
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            borderRadius: "14px", overflow: "hidden", cursor: "pointer",
            backgroundColor: "#2a1010",
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "all 0.25s ease",
            boxShadow: hov ? "0 14px 40px rgba(242,13,24,0.3)" : "0 4px 14px rgba(0,0,0,0.4)",
          }}
        >
          {/* Poster */}
          <div style={{ position: "relative", paddingBottom: "150%", overflow: "hidden" }}>
            <img
              src={poster} alt={title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => e.target.src = FALLBACK_POSTER}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(34,16,17,0.97) 0%,transparent 55%)" }} />

            {/* Type badge */}
            <div style={{
              position: "absolute", top: "8px", left: "8px",
              backgroundColor: type === "tv" ? "rgba(96,165,250,0.85)" : "rgba(242,13,24,0.85)",
              color: "white", fontSize: "9px", fontWeight: "700",
              padding: "2px 7px", borderRadius: "4px", letterSpacing: "0.5px",
            }}>{type === "tv" ? "TV" : "MOVIE"}</div>

            {/* Time ago badge — bottom left */}
            {timeAgo && (
              <div style={{
                position: "absolute", bottom: "44px", left: "8px",
                backgroundColor: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(4px)",
                color: "rgba(255,255,255,0.65)", fontSize: "9px", fontWeight: "600",
                padding: "2px 7px", borderRadius: "4px",
                display: "flex", alignItems: "center", gap: "3px",
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>schedule</span>
                {timeAgo}
              </div>
            )}

            {/* Hover play overlay */}
            {hov && (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                backgroundColor: "rgba(242,13,24,0.08)",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  backgroundColor: "#f20d18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(242,13,24,0.6)",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "white" }}>play_arrow</span>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div style={{ padding: "10px 12px 12px" }}>
            <p style={{
              color: "white", fontSize: "13px", fontWeight: "700",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{title}</p>
          </div>
        </div>
      </Link>

      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={removing}
        title="Remove from history"
        style={{
          position: "absolute", top: "8px", right: "8px",
          width: "30px", height: "30px", borderRadius: "50%",
          backgroundColor: removing ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: removing ? "rgba(255,255,255,0.3)" : "#f87171",
          cursor: removing ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", zIndex: 2,
        }}
        onMouseEnter={e => { if (!removing) e.currentTarget.style.backgroundColor = "rgba(242,13,24,0.8)"; }}
        onMouseLeave={e => { if (!removing) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.7)"; }}
      >
        {removing
          ? <svg style={{ animation: "spin 0.7s linear infinite", width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none"><circle style={{ opacity: 0.3 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="3"/><path style={{ opacity: 0.8 }} fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>
          : <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
        }
      </button>
    </div>
  );
};

// ─── WATCH HISTORY PAGE ────────────────────────────────────────
export default function WatchHistory() {
  const navigate      = useNavigate();
  const { token }     = useSelector(s => s.auth);
  const [history,     setHistory]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [clearingAll, setClearingAll] = useState(false);
  const [toast,       setToast]       = useState("");
  const toastRef = React.useRef(null);

  const showToast = (msg) => {
    clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${BACKEND}/api/users/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setHistory(data.watchHistory || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [token]);

  const handleRemove = async (movieId) => {
    try {
      const res  = await fetch(`${BACKEND}/api/users/history/${movieId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHistory(prev => prev.filter(h => String(h.movieId) !== String(movieId)));
        showToast("Removed from history");
      }
    } catch { showToast("Failed to remove"); }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear your entire watch history?")) return;
    setClearingAll(true);
    try {
      const res  = await fetch(`${BACKEND}/api/users/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { setHistory([]); showToast("History cleared"); }
    } catch { showToast("Failed to clear"); }
    finally { setClearingAll(false); }
  };

  const movies  = history.filter(h => (h.mediaType || "movie") !== "tv");
  const tvShows = history.filter(h => h.mediaType === "tv");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#221011", fontFamily: "Inter, sans-serif", paddingTop: "80px" }}>
      <div className="hist-outer">

        {/* ── Header ── */}
        <div className="hist-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "5px", height: "36px", backgroundColor: "#60a5fa", borderRadius: "3px" }} />
              <h1 style={{ color: "white", fontSize: "32px", fontWeight: "900" }}>Watch History</h1>
              {!loading && (
                <span style={{
                  backgroundColor: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)",
                  color: "#93c5fd", fontSize: "13px", fontWeight: "700",
                  padding: "4px 14px", borderRadius: "20px",
                }}>{history.length} watched</span>
              )}
            </div>

            {/* Clear All */}
            {!loading && history.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearingAll}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  backgroundColor: "rgba(242,13,24,0.1)",
                  border: "1px solid rgba(242,13,24,0.25)",
                  color: "#fca5a5", borderRadius: "10px",
                  padding: "9px 18px", fontSize: "13px", fontWeight: "600",
                  cursor: clearingAll ? "not-allowed" : "pointer",
                  fontFamily: "Inter, sans-serif", transition: "all 0.2s",
                  opacity: clearingAll ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!clearingAll) e.currentTarget.style.backgroundColor = "rgba(242,13,24,0.2)"; }}
                onMouseLeave={e => { if (!clearingAll) e.currentTarget.style.backgroundColor = "rgba(242,13,24,0.1)"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete_sweep</span>
                Clear All
              </button>
            )}
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", paddingLeft: "17px" }}>
            Everything you've watched — click ✕ to remove
          </p>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="hist-grid">
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>

        /* ── Empty ── */
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "80px", color: "rgba(96,165,250,0.2)", display: "block", marginBottom: "20px" }}>
              history
            </span>
            <h2 style={{ color: "rgba(255,255,255,0.4)", fontSize: "22px", fontWeight: "700", marginBottom: "12px" }}>
              No watch history yet
            </h2>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "15px", marginBottom: "28px" }}>
              Start watching movies and TV shows to build your history
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/movies" style={{
                backgroundColor: "#f20d18", color: "white",
                borderRadius: "12px", padding: "13px 28px",
                fontSize: "15px", fontWeight: "700", textDecoration: "none",
                boxShadow: "0 6px 24px rgba(242,13,24,0.3)",
              }}>Browse Movies</Link>
              <Link to="/tv" style={{
                backgroundColor: "rgba(255,255,255,0.08)", color: "white",
                borderRadius: "12px", padding: "13px 28px",
                fontSize: "15px", fontWeight: "700", textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>Browse TV Shows</Link>
            </div>
          </div>

        /* ── Content ── */
        ) : (
          <>
            {/* Movies section */}
            {movies.length > 0 && (
              <div style={{ marginBottom: "48px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ width: "4px", height: "20px", backgroundColor: "#f20d18", borderRadius: "2px" }} />
                  <h2 style={{ color: "white", fontSize: "18px", fontWeight: "700" }}>Movies</h2>
                  <span style={{
                    backgroundColor: "rgba(242,13,24,0.1)", border: "1px solid rgba(242,13,24,0.2)",
                    color: "#fca5a5", fontSize: "11px", fontWeight: "600",
                    padding: "2px 10px", borderRadius: "20px",
                  }}>{movies.length}</span>
                </div>
                <div className="hist-grid">
                  {movies.map(item => <HistCard key={item.movieId} item={item} onRemove={handleRemove} />)}
                </div>
              </div>
            )}

            {/* TV section */}
            {tvShows.length > 0 && (
              <div style={{ marginBottom: "48px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ width: "4px", height: "20px", backgroundColor: "#60a5fa", borderRadius: "2px" }} />
                  <h2 style={{ color: "white", fontSize: "18px", fontWeight: "700" }}>TV Shows</h2>
                  <span style={{
                    backgroundColor: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)",
                    color: "#93c5fd", fontSize: "11px", fontWeight: "600",
                    padding: "2px 10px", borderRadius: "20px",
                  }}>{tvShows.length}</span>
                </div>
                <div className="hist-grid">
                  {tvShows.map(item => <HistCard key={item.movieId} item={item} onRemove={handleRemove} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%",
          transform: "translateX(-50%)", zIndex: 999,
          background: "#0a1a0a", border: "1px solid rgba(34,197,94,0.4)",
          color: "#86efac", padding: "12px 24px", borderRadius: "12px",
          fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          animation: "slideUp 0.3s ease", fontFamily: "Inter, sans-serif",
        }}>✅ {toast}</div>
      )}

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        * { box-sizing: border-box; }

        .hist-outer  { max-width: 1300px; margin: 0 auto; padding: 0 40px 80px; }
        .hist-header { margin-bottom: 32px; }
        .hist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
        }

        @media (max-width: 1024px) { .hist-outer { padding: 0 24px 60px; } }
        @media (max-width: 768px) {
          .hist-outer { padding: 0 16px 60px; }
          .hist-header h1 { font-size: 24px !important; }
          .hist-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
        }
        @media (max-width: 400px) {
          .hist-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
        *::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
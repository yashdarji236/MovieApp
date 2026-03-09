import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getMovieDetails, getTVDetails,
  getMovieVideos, getTVVideos,
  getMovieCredits, getTVCredits,
  getSimilarMovies, getSimilarTV,
  getTrailerKey, formatRuntime,
  IMG_W500, IMG_ORIGINAL, FALLBACK_POSTER, FALLBACK_BACKDROP,
} from "../services/tmdb";

const BACKEND = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}`

/* ── Toast ── */
const Toast = ({ msg, type }) => !msg ? null : (
  <div style={{
    position: "fixed", bottom: 28, left: "50%",
    transform: "translateX(-50%)", zIndex: 9999,
    background: type === "error" ? "#2a0505" : "#051a05",
    border: `1px solid ${type === "error" ? "rgba(242,13,24,0.5)" : "rgba(34,197,94,0.4)"}`,
    color: type === "error" ? "#fca5a5" : "#86efac",
    padding: "12px 24px", borderRadius: 12,
    fontSize: 14, fontWeight: 600,
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    whiteSpace: "nowrap", fontFamily: "Inter, sans-serif",
    animation: "slideUp 0.3s ease",
  }}>
    {type === "error" ? "⚠️" : "✅"} {msg}
  </div>
);

/* ── Similar Card ── */
const SimilarCard = ({ movie, type }) => {
  const [hov, setHov] = useState(false);
  const title  = movie.title || movie.name || "Unknown";
  const poster = movie.poster_path ? `${IMG_W500}${movie.poster_path}` : FALLBACK_POSTER;
  const rating = movie.vote_average?.toFixed(1);
  const year   = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  return (
    <Link to={`/${type}/${movie.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          width: 148, borderRadius: 12, overflow: "hidden",
          cursor: "pointer", position: "relative", flexShrink: 0,
          transform: hov ? "scale(1.05)" : "scale(1)",
          transition: "all 0.3s ease",
          boxShadow: hov ? "0 12px 36px rgba(242,13,24,0.35)" : "0 4px 12px rgba(0,0,0,0.5)",
          background: "#2a1010",
        }}
      >
        <img src={poster} alt={title}
          style={{ width: "100%", height: 222, objectFit: "cover", display: "block" }}
          onError={e => e.target.src = FALLBACK_POSTER}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(34,16,17,0.97) 0%,transparent 55%)" }} />
        {rating && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(242,13,24,0.9)", color: "white",
            fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 6,
          }}>⭐ {rating}</div>
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px 12px" }}>
          <p style={{ color: "white", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{title}</p>
          {year && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{year}</p>}
        </div>
        {hov && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(242,13,24,0.08)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f20d18", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(242,13,24,0.6)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "white" }}>play_arrow</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

/* ── MAIN ── */
export default function MovieDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { token }  = useSelector(s => s.auth);
  const type       = location.pathname.startsWith("/tv") ? "tv" : "movie";
  const rowRef     = useRef(null);

  const [detail,      setDetail]      = useState(null);
  const [credits,     setCredits]     = useState(null);
  const [similar,     setSimilar]     = useState([]);
  const [trailer,     setTrailer]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [inFav,       setInFav]       = useState(false);
  const [inHistory,   setInHistory]   = useState(false);
  const [favLoad,     setFavLoad]     = useState(false);
  const [histLoad,    setHistLoad]    = useState(false);
  const [toast,       setToast]       = useState("");
  const [toastType,   setToastType]   = useState("success");
  const toastRef = useRef(null);

  const showMsg = (msg, t = "success") => {
    clearTimeout(toastRef.current);
    setToast(msg); setToastType(t);
    toastRef.current = setTimeout(() => setToast(""), 3000);
  };

  /* fetch */
  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    setLoading(true); setDetail(null); setSimilar([]); setCredits(null);
    setInFav(false); setInHistory(false);
    const run = async () => {
      try {
        const [dRes, vRes, sRes, cRes] = await Promise.all([
          type === "tv" ? getTVDetails(id)  : getMovieDetails(id),
          type === "tv" ? getTVVideos(id)   : getMovieVideos(id),
          type === "tv" ? getSimilarTV(id)  : getSimilarMovies(id),
          type === "tv" ? getTVCredits(id)  : getMovieCredits(id),
        ]);
        setDetail(dRes.data);
        setTrailer(getTrailerKey(vRes.data));
        setSimilar((sRes.data.results || []).slice(0, 16));
        setCredits(cRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    run();
  }, [id, type]);

  /* check fav/history */
  useEffect(() => {
    if (!token || !id) return;
    const check = async () => {
      try {
        const [f, h] = await Promise.all([
          fetch(`${BACKEND}/api/users/favorites`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BACKEND}/api/users/history`,   { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const fd = await f.json(); const hd = await h.json();
        if (fd.success) setInFav(fd.favorites?.some(x => String(x.movieId) === String(id)));
        if (hd.success) setInHistory(hd.watchHistory?.some(x => String(x.movieId) === String(id)));
      } catch {}
    };
    check();
  }, [id, token]);

  /* toggle favorite */
  const toggleFav = async () => {
    if (!token) { navigate("/login"); return; }
    setFavLoad(true);
    try {
      if (inFav) {
        const r = await fetch(`${BACKEND}/api/users/favorites/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        if (d.success) { setInFav(false); showMsg("Removed from favorites"); }
        else showMsg(d.message || "Failed", "error");
      } else {
        const r = await fetch(`${BACKEND}/api/users/favorites`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ movieId: String(id), title, poster, mediaType: type }),
        });
        const d = await r.json();
        if (d.success) { setInFav(true); showMsg("Added to favorites ❤️"); }
        else showMsg(d.message || "Failed", "error");
      }
    } catch { showMsg("Something went wrong", "error"); }
    finally { setFavLoad(false); }
  };

  /* add history */
  const addHistory = async () => {
    if (!token) { navigate("/login"); return; }
    if (inHistory) { showMsg("Already in watch history"); return; }
    setHistLoad(true);
    try {
      const r = await fetch(`${BACKEND}/api/users/history`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId: String(id), title, poster, mediaType: type }),
      });
      const d = await r.json();
      if (d.success) { setInHistory(true); showMsg("Added to watch history 🕐"); }
      else showMsg(d.message || "Failed", "error");
    } catch { showMsg("Something went wrong", "error"); }
    finally { setHistLoad(false); }
  };

  /* derived */
  const poster   = detail?.poster_path   ? `${IMG_W500}${detail.poster_path}`   : FALLBACK_POSTER;
  const backdrop = detail?.backdrop_path ? `${IMG_ORIGINAL}${detail.backdrop_path}` : FALLBACK_BACKDROP;
  const title    = detail?.title || detail?.name || "Unknown";
  const year     = (detail?.release_date || detail?.first_air_date || "").slice(0, 4);
  const runtime  = detail?.runtime ? formatRuntime(detail.runtime) : null;
  const rating   = detail?.vote_average?.toFixed(1);
  const votes    = detail?.vote_count;
  const seasons  = detail?.number_of_seasons;
  const episodes = detail?.number_of_episodes;
  const genres   = detail?.genres || [];
  const cast     = credits?.cast?.slice(0, 12) || [];

  /* loading */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#221011", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 44, height: 44, border: "3px solid #f20d18", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!detail) return (
    <div style={{ minHeight: "100vh", background: "#221011", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "Inter, sans-serif" }}>
      <span className="material-symbols-outlined" style={{ fontSize: 64, color: "#f20d18" }}>movie_filter</span>
      <p style={{ color: "white", fontSize: 20, fontWeight: 700 }}>Not found</p>
      <button onClick={() => navigate(-1)} style={{ background: "#f20d18", color: "white", border: "none", borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontWeight: 700, fontFamily: "Inter, sans-serif", fontSize: 15 }}>Go Back</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#221011", fontFamily: "Inter, sans-serif", color: "white" }}>

      {/* ══ HERO BACKDROP ══ */}
      <div className="md-hero">
        <img src={backdrop} alt={title} className="md-hero-img" onError={e => e.target.src = FALLBACK_BACKDROP} />
        <div className="md-hero-grad-h" />
        <div className="md-hero-grad-v" />

        {/* Back btn */}
        <button onClick={() => navigate(-1)} className="md-back-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Back
        </button>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="md-outer">
        <div className="md-grid">

          {/* ── LEFT: Poster ── */}
          <div className="md-left">
            <img src={poster} alt={title} className="md-poster" onError={e => e.target.src = FALLBACK_POSTER} />
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="md-right">

            {/* Badges row */}
            <div className="md-badges">
              <span className="md-badge-type">{type === "tv" ? "TV Show" : "Movie"}</span>
              {year && <span className="md-badge-pill">📅 {year}</span>}
              {runtime && <span className="md-badge-pill">🕐 {runtime}</span>}
            </div>

            {/* Title */}
            <h1 className="md-title">{title}</h1>

            {/* Rating row */}
            {(rating || votes || seasons) && (
              <div className="md-meta-row">
                {rating && <span className="md-meta-item">⭐ <strong>{rating}</strong> ({votes?.toLocaleString()} votes)</span>}
                {runtime && <span className="md-meta-sep">·</span>}
                {runtime && <span className="md-meta-item">🕐 {runtime}</span>}
                {seasons && <span className="md-meta-sep">·</span>}
                {seasons && <span className="md-meta-item">📺 {seasons} Season{seasons > 1 ? "s" : ""} · {episodes} Episodes</span>}
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="md-genres">
                {genres.map(g => <span key={g.id} className="md-genre-tag">{g.name}</span>)}
              </div>
            )}

            {/* Overview */}
            <p className="md-overview">{detail.overview || "No description available."}</p>

            {/* ── ACTION BUTTONS ── */}
            <div className="md-actions">
              {trailer && (
                <button className="md-btn-primary" onClick={() => setShowTrailer(true)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>play_arrow</span>
                  Watch Trailer
                </button>
              )}
              <button className={`md-btn-secondary ${inFav ? "md-btn-active-red" : ""}`} onClick={toggleFav} disabled={favLoad}>
                {favLoad
                  ? <span className="md-spinner" />
                  : <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: inFav ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                }
                {inFav ? "In Favorites" : "Add to Favorites"}
              </button>
              <button className={`md-btn-secondary ${inHistory ? "md-btn-active-blue" : ""}`} onClick={addHistory} disabled={histLoad}>
                {histLoad
                  ? <span className="md-spinner" />
                  : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>
                }
                {inHistory ? "In Watch History" : "Add to History"}
              </button>
              <button className="md-btn-ghost" onClick={() => navigate(-1)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                Go Back
              </button>
            </div>

            {/* ── STATS BAR ── */}
            <div className="md-stats-bar">
              {rating && <div className="md-stat"><span className="md-stat-val red">{rating}</span><span className="md-stat-lbl">RATING</span></div>}
              {votes  && <div className="md-stat"><span className="md-stat-val red">{votes?.toLocaleString()}</span><span className="md-stat-lbl">VOTES</span></div>}
              {year   && <div className="md-stat"><span className="md-stat-val red">{year}</span><span className="md-stat-lbl">YEAR</span></div>}
              {runtime && <div className="md-stat"><span className="md-stat-val">{runtime}</span><span className="md-stat-lbl">RUNTIME</span></div>}
              {seasons && <div className="md-stat"><span className="md-stat-val red">{seasons}</span><span className="md-stat-lbl">SEASONS</span></div>}
              {episodes && <div className="md-stat"><span className="md-stat-val">{episodes}</span><span className="md-stat-lbl">EPISODES</span></div>}
            
            </div>
          </div>
        </div>

        {/* ── CAST ── */}
        {cast.length > 0 && (
          <div className="md-section">
            <div className="md-section-head">
              <div className="md-redbar" />
              <h2 className="md-section-title">Cast</h2>
            </div>
            <div className="md-cast-row">
              {cast.map(p => (
                <div key={p.id} className="md-cast-card">
                  <img
                    src={p.profile_path ? `${IMG_W500}${p.profile_path}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=3d1515&color=f20d18&size=80`}
                    alt={p.name} className="md-cast-avatar"
                    onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=3d1515&color=f20d18&size=80`}
                  />
                  <p className="md-cast-name">{p.name}</p>
                  <p className="md-cast-char">{p.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SIMILAR ── */}
        {similar.length > 0 && (
          <div className="md-section">
            <div className="md-section-head" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="md-redbar" />
                <h2 className="md-section-title">More Like This</h2>
                <span className="md-count">{similar.length}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="md-scroll-btn" onClick={() => rowRef.current?.scrollBy({ left: -560, behavior: "smooth" })}>‹</button>
                <button className="md-scroll-btn" onClick={() => rowRef.current?.scrollBy({ left: 560, behavior: "smooth" })}>›</button>
              </div>
            </div>
            <div ref={rowRef} className="md-similar-row">
              {similar.map(m => <SimilarCard key={m.id} movie={m} type={type} />)}
            </div>
          </div>
        )}
      </div>

      {/* ══ TRAILER MODAL ══ */}
      {showTrailer && trailer && (
        <div onClick={() => setShowTrailer(false)} style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.93)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "90%", maxWidth: 920 }}>
            <button onClick={() => setShowTrailer(false)} style={{ position: "absolute", top: -44, right: 0, background: "none", border: "none", color: "white", fontSize: 28, cursor: "pointer" }}>✕</button>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 16, overflow: "hidden" }}>
              <iframe src={`https://www.youtube.com/embed/${trailer}?autoplay=1`} title="Trailer"
                allow="autoplay; encrypted-media" allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} type={toastType} />

      <style>{`
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        * { box-sizing: border-box; }
        *::-webkit-scrollbar { display: none; }

        /* HERO */
        .md-hero { position:relative; height:62vh; min-height:380px; overflow:hidden; }
        .md-hero-img { width:100%; height:100%; object-fit:cover; object-position:center top; display:block; }
        .md-hero-grad-h { position:absolute; inset:0; background:linear-gradient(to right,rgba(34,16,17,0.15) 0%,rgba(34,16,17,0.05) 100%); }
        .md-hero-grad-v { position:absolute; inset:0; background:linear-gradient(to top,#221011 0%,rgba(34,16,17,0.3) 50%,transparent 100%); }
        .md-back-btn {
          position:absolute; top:80px; left:32px; z-index:6;
          display:flex; align-items:center; gap:6px;
          background:rgba(0,0,0,0.5); backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,0.15); border-radius:10px;
          color:white; padding:9px 16px; cursor:pointer;
          font-size:14px; font-weight:600; font-family:Inter,sans-serif;
          transition:background 0.2s;
        }
        .md-back-btn:hover { background:rgba(242,13,24,0.3); }

        /* OUTER */
        .md-outer { max-width:1200px; margin:0 auto; padding:0 40px 80px; }

        /* GRID */
        .md-grid {
          display:grid; grid-template-columns:280px 1fr;
          gap:48px; margin-top:-180px;
          position:relative; z-index:5; align-items:start;
        }

        /* LEFT */
        .md-left { position:sticky; top:80px; }
        .md-poster { width:100%; border-radius:16px; display:block; box-shadow:0 24px 60px rgba(0,0,0,0.85); }

        /* RIGHT */
        .md-right { padding-top:120px; }

        /* BADGES */
        .md-badges { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px; }
        .md-badge-type { background:#f20d18; color:white; font-size:11px; font-weight:700; padding:4px 12px; border-radius:6px; text-transform:uppercase; letter-spacing:1px; }
        .md-badge-pill { background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); font-size:12px; font-weight:600; padding:4px 12px; border-radius:20px; backdrop-filter:blur(6px); }

        /* TITLE */
        .md-title { color:white; font-size:clamp(24px,4vw,52px); font-weight:900; line-height:1.1; margin:0 0 12px; letter-spacing:-0.5px; }

        /* META ROW */
        .md-meta-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
        .md-meta-item { color:rgba(255,255,255,0.55); font-size:13px; }
        .md-meta-sep { color:rgba(255,255,255,0.25); }

        /* GENRES */
        .md-genres { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; }
        .md-genre-tag { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.15); color:rgba(255,255,255,0.7); font-size:12px; font-weight:600; padding:5px 14px; border-radius:20px; }

        /* OVERVIEW */
        .md-overview { color:rgba(255,255,255,0.6); font-size:15px; line-height:1.8; margin-bottom:28px; }

        /* ACTIONS */
        .md-actions { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:24px; }
        .md-btn-primary {
          display:flex; align-items:center; gap:8px;
          background:#f20d18; color:white; border:none;
          border-radius:10px; padding:13px 22px;
          font-size:14px; font-weight:700; cursor:pointer;
          font-family:Inter,sans-serif;
          box-shadow:0 6px 24px rgba(242,13,24,0.35);
          transition:background 0.2s;
        }
        .md-btn-primary:hover { background:#c50b13; }
        .md-btn-secondary {
          display:flex; align-items:center; gap:8px;
          background:rgba(255,255,255,0.07);
          border:1px solid rgba(255,255,255,0.15);
          color:rgba(255,255,255,0.8);
          border-radius:10px; padding:13px 18px;
          font-size:14px; font-weight:600; cursor:pointer;
          font-family:Inter,sans-serif; transition:all 0.2s;
        }
        .md-btn-secondary:hover { background:rgba(255,255,255,0.13); }
        .md-btn-secondary:disabled { opacity:0.5; cursor:not-allowed; }
        .md-btn-active-red { background:rgba(248,113,113,0.15) !important; border-color:rgba(248,113,113,0.4) !important; color:#f87171 !important; }
        .md-btn-active-blue { background:rgba(96,165,250,0.15) !important; border-color:rgba(96,165,250,0.4) !important; color:#60a5fa !important; }
        .md-btn-ghost {
          display:flex; align-items:center; gap:8px;
          background:transparent; border:1px solid rgba(255,255,255,0.12);
          color:rgba(255,255,255,0.5);
          border-radius:10px; padding:13px 18px;
          font-size:14px; font-weight:600; cursor:pointer;
          font-family:Inter,sans-serif; transition:all 0.2s;
        }
        .md-btn-ghost:hover { border-color:rgba(255,255,255,0.3); color:white; }
        .md-spinner {
          width:16px; height:16px; border:2px solid currentColor;
          border-top-color:transparent; border-radius:50%;
          display:inline-block; animation:spin 0.7s linear infinite; flex-shrink:0;
        }

        /* STATS BAR */
        .md-stats-bar {
          display:flex; gap:0; flex-wrap:nowrap; overflow-x:auto;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:14px; padding:16px 20px;
        }
        .md-stat {
          display:flex; flex-direction:column; align-items:center;
          flex:1; min-width:60px; gap:4px;
          border-right:1px solid rgba(255,255,255,0.07);
          padding:0 12px;
        }
        .md-stat:last-child { border-right:none; }
        .md-stat-val { font-size:22px; font-weight:800; color:white; }
        .md-stat-val.red { color:#f20d18; }
        .md-stat-lbl { font-size:10px; font-weight:700; color:rgba(255,255,255,0.35); letter-spacing:1px; text-transform:uppercase; }

        /* SECTIONS */
        .md-section { margin-top:52px; }
        .md-section-head { display:flex; align-items:center; gap:10px; margin-bottom:18px; }
        .md-redbar { width:4px; height:22px; background:#f20d18; border-radius:2px; flex-shrink:0; }
        .md-section-title { color:white; font-size:20px; font-weight:700; }
        .md-count { background:rgba(242,13,24,0.12); border:1px solid rgba(242,13,24,0.25); color:#fca5a5; font-size:11px; font-weight:600; padding:2px 10px; border-radius:20px; }

        /* CAST */
        .md-cast-row { display:flex; gap:16px; overflow-x:auto; padding-bottom:8px; scrollbar-width:none; }
        .md-cast-card { flex-shrink:0; text-align:center; width:80px; }
        .md-cast-avatar { width:72px; height:72px; border-radius:50%; object-fit:cover; display:block; margin:0 auto 8px; border:2px solid rgba(242,13,24,0.3); }
        .md-cast-name { color:white; font-size:11px; font-weight:600; line-height:1.3; margin-bottom:2px; }
        .md-cast-char { color:rgba(255,255,255,0.35); font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        /* SIMILAR */
        .md-scroll-btn { width:32px; height:32px; border-radius:50%; background:rgba(242,13,24,0.12); border:1px solid rgba(242,13,24,0.25); color:white; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; transition:background 0.2s; }
        .md-scroll-btn:hover { background:#f20d18; }
        .md-similar-row { display:flex; gap:12px; overflow-x:auto; padding-bottom:16px; scrollbar-width:none; }

        /* ── TABLET ── */
        @media (min-width:769px) and (max-width:1100px) {
          .md-grid { grid-template-columns:220px 1fr; gap:32px; margin-top:-140px; }
          .md-right { padding-top:90px; }
          .md-outer { padding:0 24px 80px; }
          .md-back-btn { left:24px; }
        }

        /* ── MOBILE ── */
        @media (max-width:768px) {
          .md-hero { height:220px; min-height:220px; }
          .md-back-btn { top:60px; left:16px; padding:7px 12px; font-size:13px; }
          .md-outer { padding:0 16px 60px; }

          .md-grid {
            grid-template-columns:1fr;
            margin-top:0;
            gap:0;
          }

          /* poster row: side by side with info on mobile */
          .md-left {
            position:static;
            display:flex;
            flex-direction:row;
            align-items:flex-start;
            gap:16px;
            padding:16px 0 20px;
          }
          .md-poster { width:120px; border-radius:12px; flex-shrink:0; }

          /* mobile inline info beside poster */
          .md-left::after { display:none; }

          .md-right { padding-top:0; }

          .md-title { font-size:22px; }

          .md-actions { gap:8px; }
          .md-btn-primary, .md-btn-secondary, .md-btn-ghost {
            padding:11px 14px; font-size:13px;
          }

          .md-stats-bar { padding:12px 10px; }
          .md-stat { padding:0 8px; }
          .md-stat-val { font-size:16px; }

          .md-section { margin-top:32px; }
        }

        /* Extra small */
        @media (max-width:400px) {
          .md-poster { width:100px; }
          .md-title { font-size:19px; }
        }
      `}</style>
    </div>
  );
}
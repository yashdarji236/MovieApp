import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchMulti, searchMovies, searchTV, IMG_W500, FALLBACK_POSTER } from "../services/tmdb";

// ─── Skeleton ──────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{
    borderRadius: "12px", overflow: "hidden", backgroundColor: "#2a1010",
  }}>
    <div style={{
      width: "100%", paddingBottom: "150%",
      background: "linear-gradient(90deg,#2a1010 25%,#3d1515 50%,#2a1010 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
    }} />
    <div style={{ padding: "10px" }}>
      <div style={{ height: "13px", borderRadius: "4px", marginBottom: "6px", background: "linear-gradient(90deg,#2a1010 25%,#3d1515 50%,#2a1010 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ height: "11px", width: "60%", borderRadius: "4px", background: "linear-gradient(90deg,#2a1010 25%,#3d1515 50%,#2a1010 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
    </div>
  </div>
);

// ─── Result Card ───────────────────────────────────────────────
const ResultCard = ({ item }) => {
  const [hov, setHov] = useState(false);
  const isTV    = item.media_type === "tv" || (!item.media_type && item.first_air_date);
  const type    = isTV ? "tv" : "movie";
  const title   = item.title || item.name || "Unknown";
  const poster  = item.poster_path ? `${IMG_W500}${item.poster_path}` : null;
  const rating  = item.vote_average?.toFixed(1);
  const year    = (item.release_date || item.first_air_date || "").slice(0, 4);
  const isPersonType = item.media_type === "person";

  if (isPersonType) return null; // skip person results

  return (
    <Link to={`/${type}/${item.id}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: "12px", overflow: "hidden", cursor: "pointer",
          backgroundColor: "#2a1010", position: "relative",
          transform: hov ? "scale(1.04)" : "scale(1)",
          transition: "all 0.25s ease",
          boxShadow: hov ? "0 12px 36px rgba(242,13,24,0.35)" : "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        {/* Poster */}
        {poster ? (
          <div style={{ position: "relative", paddingBottom: "150%", overflow: "hidden" }}>
            <img src={poster} alt={title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
            />
            <div style={{
              position: "absolute", inset: 0, display: "none",
              alignItems: "center", justifyContent: "center",
              backgroundColor: "#1a0808", flexDirection: "column", gap: "8px",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "rgba(242,13,24,0.4)" }}>
                {isTV ? "tv" : "movie"}
              </span>
            </div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(34,16,17,0.97) 0%,transparent 55%)" }} />
          </div>
        ) : (
          <div style={{
            paddingBottom: "150%", position: "relative",
            backgroundColor: "#1a0808",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "rgba(242,13,24,0.3)" }}>
                {isTV ? "tv" : "movie"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>No Image</span>
            </div>
          </div>
        )}

        {/* Rating badge */}
        {rating && parseFloat(rating) > 0 && (
          <div style={{
            position: "absolute", top: "8px", right: "8px",
            backgroundColor: "rgba(242,13,24,0.9)", color: "white",
            fontSize: "10px", fontWeight: "700", padding: "3px 7px", borderRadius: "6px",
          }}>⭐ {rating}</div>
        )}

        {/* Type badge */}
        <div style={{
          position: "absolute", top: "8px", left: "8px",
          backgroundColor: isTV ? "rgba(96,165,250,0.85)" : "rgba(242,13,24,0.85)",
          color: "white", fontSize: "9px", fontWeight: "700",
          padding: "2px 7px", borderRadius: "4px", letterSpacing: "0.5px",
        }}>{isTV ? "TV" : "MOVIE"}</div>

        {/* Hover play */}
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

        {/* Info */}
        <div style={{ padding: "10px 12px 12px" }}>
          <p style={{
            color: "white", fontSize: "13px", fontWeight: "700",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            marginBottom: "3px",
          }}>{title}</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{year || "—"}</p>
        </div>
      </div>
    </Link>
  );
};

// ─── Empty State ───────────────────────────────────────────────
const EmptyState = ({ query }) => (
  <div style={{ textAlign: "center", padding: "80px 20px" }}>
    <span className="material-symbols-outlined" style={{ fontSize: "72px", color: "rgba(242,13,24,0.3)", display: "block", marginBottom: "20px" }}>
      search_off
    </span>
    <h2 style={{ color: "white", fontSize: "22px", fontWeight: "700", marginBottom: "10px" }}>
      No results for "{query}"
    </h2>
    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "15px" }}>
      Try a different title, actor, or genre
    </p>
  </div>
);

// ─── SEARCH PAGE ───────────────────────────────────────────────
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query,      setQuery]      = useState(initialQuery);
  const [inputVal,   setInputVal]   = useState(initialQuery);
  const [filter,     setFilter]     = useState("all"); // all | movie | tv
  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRes,   setTotalRes]   = useState(0);
  const [loadingMore,setLoadingMore]= useState(false);

  const inputRef   = useRef(null);
  const debounceRef = useRef(null);

  // focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // search when query or filter changes
  useEffect(() => {
    if (!query.trim()) { setResults([]); setTotalRes(0); return; }
    doSearch(query, filter, 1, false);
    setSearchParams(query ? { q: query } : {});
  }, [query, filter]);

  const doSearch = async (q, f, pg, append) => {
    if (!q.trim()) return;
    append ? setLoadingMore(true) : setLoading(true);
    try {
      let res;
      if (f === "movie") res = await searchMovies(q, pg);
      else if (f === "tv") res = await searchTV(q, pg);
      else res = await searchMulti(q, pg);

      const items = (res.data.results || []).filter(i => i.media_type !== "person" && (i.poster_path || i.backdrop_path || i.title || i.name));
      setTotalPages(res.data.total_pages || 1);
      setTotalRes(res.data.total_results || 0);
      setPage(pg);
      append ? setResults(prev => [...prev, ...items]) : setResults(items);
    } catch (e) { console.error(e); }
    finally { append ? setLoadingMore(false) : setLoading(false); }
  };

  const handleInput = (val) => {
    setInputVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(val);
      setPage(1);
    }, 400);
  };

  const handleLoadMore = () => doSearch(query, filter, page + 1, true);

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1);
    setResults([]);
  };

  const clearInput = () => {
    setInputVal(""); setQuery("");
    setResults([]); setTotalRes(0);
    inputRef.current?.focus();
    setSearchParams({});
  };

  // filter displayed results
  const displayed = results.filter(r => {
    if (filter === "movie") return r.media_type !== "tv" && !r.first_air_date;
    if (filter === "tv")    return r.media_type === "tv" || r.first_air_date;
    return true;
  });

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#221011",
      fontFamily: "Inter, sans-serif", paddingTop: "80px",
    }}>
      <div className="search-outer">

        {/* ── Search Bar ── */}
        <div className="search-hero">
          <h1 className="search-heading">
            <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "#f20d18", verticalAlign: "middle", marginRight: "10px" }}>search</span>
            Search
          </h1>
          <p className="search-sub">Find movies, TV shows and more</p>

          {/* Input */}
          <div className="search-input-wrap">
            <span className="material-symbols-outlined search-icon-left">search</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => handleInput(e.target.value)}
              placeholder="Search movies, TV shows..."
              className="search-input"
            />
            {inputVal && (
              <button onClick={clearInput} className="search-clear-btn">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="search-filters">
            {[
              { key: "all",   label: "All",       icon: "auto_awesome" },
              { key: "movie", label: "Movies",    icon: "movie" },
              { key: "tv",    label: "TV Shows",  icon: "tv" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => handleFilterChange(f.key)}
                className={`search-filter-btn ${filter === f.key ? "active" : ""}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results area ── */}
        {!query.trim() ? (
          /* Initial state — no query */
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "80px", color: "rgba(242,13,24,0.2)", display: "block", marginBottom: "20px" }}>
              movie_filter
            </span>
            <h2 style={{ color: "rgba(255,255,255,0.25)", fontSize: "20px", fontWeight: "600" }}>
              Start typing to search
            </h2>
          </div>
        ) : loading ? (
          /* Loading skeletons */
          <div>
            <div style={{ padding: "0 0 20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "140px", height: "16px", borderRadius: "6px", background: "linear-gradient(90deg,#2a1010 25%,#3d1515 50%,#2a1010 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            </div>
            <div className="search-grid">
              {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div>
            {/* Results count */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "24px", flexWrap: "wrap", gap: "8px",
            }}>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>
                Showing <span style={{ color: "white", fontWeight: "700" }}>{displayed.length}</span>
                {totalRes > displayed.length && (
                  <span> of <span style={{ color: "#f20d18", fontWeight: "700" }}>{totalRes.toLocaleString()}</span></span>
                )} results for <span style={{ color: "white", fontStyle: "italic" }}>"{query}"</span>
              </p>
            </div>

            {/* Grid */}
            <div className="search-grid">
              {displayed.map(item => <ResultCard key={`${item.media_type}-${item.id}`} item={item} />)}
            </div>

            {/* Load more */}
            {page < totalPages && (
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    backgroundColor: loadingMore ? "rgba(242,13,24,0.4)" : "#f20d18",
                    color: "white", border: "none", borderRadius: "12px",
                    padding: "14px 36px", fontSize: "15px", fontWeight: "700",
                    cursor: loadingMore ? "not-allowed" : "pointer",
                    fontFamily: "Inter, sans-serif",
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    boxShadow: "0 6px 24px rgba(242,13,24,0.25)",
                    transition: "all 0.2s",
                  }}
                >
                  {loadingMore ? (
                    <>
                      <svg style={{ animation: "spin 0.8s linear infinite", width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                        <path style={{ opacity: 0.75 }} fill="white" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>expand_more</span>
                      Load More Results
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        *::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }

        .search-outer {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 40px 80px;
        }

        /* HERO */
        .search-hero { margin-bottom: 36px; }
        .search-heading {
          color: white; font-size: 32px; font-weight: 900;
          margin-bottom: 6px; display: flex; align-items: center;
        }
        .search-sub {
          color: rgba(255,255,255,0.35); font-size: 14px;
          margin-bottom: 28px;
        }

        /* INPUT */
        .search-input-wrap {
          position: relative;
          max-width: 680px;
          margin-bottom: 20px;
        }
        .search-icon-left {
          position: absolute; left: 18px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.4); font-size: 22px;
          pointer-events: none;
        }
        .search-input {
          width: 100%; height: 58px;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          color: white; font-size: 16px; font-weight: 500;
          font-family: Inter, sans-serif;
          padding: 0 52px 0 54px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.25); }
        .search-input:focus {
          border-color: #f20d18;
          background: rgba(242,13,24,0.06);
        }
        .search-clear-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.08);
          border: none; border-radius: 50%;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); cursor: pointer;
          transition: all 0.2s;
        }
        .search-clear-btn:hover { background: rgba(242,13,24,0.3); color: white; }

        /* FILTERS */
        .search-filters {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .search-filter-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 30px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.55);
          font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: Inter, sans-serif;
          transition: all 0.2s;
        }
        .search-filter-btn:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .search-filter-btn.active {
          background: rgba(242,13,24,0.15);
          border-color: rgba(242,13,24,0.5);
          color: #f87171;
        }

        /* GRID */
        .search-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
        }

        /* TABLET */
        @media (max-width: 1024px) {
          .search-outer { padding: 0 24px 60px; }
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .search-outer { padding: 0 16px 60px; }
          .search-heading { font-size: 24px; }
          .search-input { height: 52px; font-size: 15px; }
          .search-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 12px;
          }
        }

        @media (max-width: 400px) {
          .search-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}
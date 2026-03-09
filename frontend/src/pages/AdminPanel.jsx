import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IMG_W500, FALLBACK_POSTER } from "../services/tmdb";

const BACKEND = "http://localhost:5000";

// ─── Helpers ───────────────────────────────────────────────────
const api = async (path, method = "GET", body, token) => {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`${BACKEND}${path}`, opts);
  return res.json();
};

const fmt = (n) => n?.toLocaleString() ?? "0";

// ─── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{
    backgroundColor: "#2a1010",
    border: `1px solid ${color}30`,
    borderRadius: "16px", padding: "22px 24px",
    display: "flex", flexDirection: "column", gap: "8px",
    position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: "-10px", right: "-10px",
      width: "80px", height: "80px", borderRadius: "50%",
      backgroundColor: `${color}10`,
    }} />
    <div style={{
      width: "42px", height: "42px", borderRadius: "12px",
      backgroundColor: `${color}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: "22px", color }}>{icon}</span>
    </div>
    <div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: "600", marginBottom: "2px", letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</p>
      <p style={{ color: "white", fontSize: "28px", fontWeight: "900" }}>{fmt(value)}</p>
      {sub && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginTop: "2px" }}>{sub}</p>}
    </div>
  </div>
);

// ─── Toast ─────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <div style={{
    position: "fixed", bottom: 28, left: "50%",
    transform: "translateX(-50%)", zIndex: 9999,
    background: type === "error" ? "#1a0808" : "#0a1a0a",
    border: `1px solid ${type === "error" ? "rgba(242,13,24,0.4)" : "rgba(34,197,94,0.4)"}`,
    color: type === "error" ? "#fca5a5" : "#86efac",
    padding: "12px 24px", borderRadius: "12px",
    fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    animation: "slideUp 0.3s ease", fontFamily: "Inter, sans-serif",
  }}>
    {type === "error" ? "❌" : "✅"} {msg}
  </div>
);

// ─── Confirm Modal ─────────────────────────────────────────────
const ConfirmModal = ({ msg, onConfirm, onCancel }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 999,
    backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
  }}>
    <div style={{
      backgroundColor: "#2a1010", border: "1px solid rgba(242,13,24,0.25)",
      borderRadius: "18px", padding: "32px", maxWidth: "400px", width: "100%",
      textAlign: "center",
    }}>
      <div style={{
        width: "56px", height: "56px", borderRadius: "50%",
        backgroundColor: "rgba(242,13,24,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#f20d18" }}>warning</span>
      </div>
      <p style={{ color: "white", fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>Are you sure?</p>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "28px" }}>{msg}</p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <button onClick={onCancel} style={{
          padding: "10px 24px", borderRadius: "10px",
          backgroundColor: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600",
          cursor: "pointer", fontFamily: "Inter, sans-serif",
        }}>Cancel</button>
        <button onClick={onConfirm} style={{
          padding: "10px 24px", borderRadius: "10px",
          backgroundColor: "#f20d18", border: "none",
          color: "white", fontSize: "14px", fontWeight: "700",
          cursor: "pointer", fontFamily: "Inter, sans-serif",
        }}>Confirm</button>
      </div>
    </div>
  </div>
);

// ─── Movie Form Modal ──────────────────────────────────────────
const MovieFormModal = ({ initial, onSave, onClose }) => {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState(initial || {
    title: "", description: "", genre: "", releaseYear: "", rating: "", duration: "",
    poster: "", backdrop: "", trailerUrl: "", featured: false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form, isEdit);
    setSaving(false);
  };

  const fieldStyle = {
    width: "100%", backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
    color: "white", fontSize: "14px", padding: "10px 14px",
    fontFamily: "Inter, sans-serif", outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = { color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "5px" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        backgroundColor: "#221011", border: "1px solid rgba(242,13,24,0.2)",
        borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "560px",
        maxHeight: "88vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ color: "white", fontSize: "18px", fontWeight: "800" }}>
            {isEdit ? "✏️ Edit Movie" : "➕ Add Movie"}
          </h2>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px",
            color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "6px 8px",
            display: "flex", alignItems: "center",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input style={fieldStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Movie title" />
            </div>
            <div>
              <label style={labelStyle}>Genre</label>
              <input style={fieldStyle} value={form.genre} onChange={e => set("genre", e.target.value)} placeholder="Action, Drama..." />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...fieldStyle, height: "80px", resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Movie description..." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Year</label>
              <input style={fieldStyle} type="number" value={form.releaseYear} onChange={e => set("releaseYear", e.target.value)} placeholder="2024" />
            </div>
            <div>
              <label style={labelStyle}>Rating</label>
              <input style={fieldStyle} type="number" step="0.1" min="0" max="10" value={form.rating} onChange={e => set("rating", e.target.value)} placeholder="7.5" />
            </div>
            <div>
              <label style={labelStyle}>Duration (min)</label>
              <input style={fieldStyle} type="number" value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="120" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Poster URL</label>
            <input style={fieldStyle} value={form.poster} onChange={e => set("poster", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label style={labelStyle}>Backdrop URL</label>
            <input style={fieldStyle} value={form.backdrop} onChange={e => set("backdrop", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label style={labelStyle}>Trailer URL</label>
            <input style={fieldStyle} value={form.trailerUrl} onChange={e => set("trailerUrl", e.target.value)} placeholder="https://youtube.com/..." />
          </div>

          {/* Featured toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              onClick={() => set("featured", !form.featured)}
              style={{
                width: "42px", height: "24px", borderRadius: "12px",
                backgroundColor: form.featured ? "#f20d18" : "rgba(255,255,255,0.12)",
                position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute", top: "3px",
                left: form.featured ? "21px" : "3px",
                width: "18px", height: "18px",
                borderRadius: "50%", backgroundColor: "white",
                transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }} />
            </div>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: "600" }}>Featured Movie</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "10px 22px", borderRadius: "10px",
            backgroundColor: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600",
            cursor: "pointer", fontFamily: "Inter, sans-serif",
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !form.title.trim()} style={{
            padding: "10px 26px", borderRadius: "10px",
            backgroundColor: saving || !form.title.trim() ? "rgba(242,13,24,0.4)" : "#f20d18",
            border: "none", color: "white", fontSize: "14px", fontWeight: "700",
            cursor: saving || !form.title.trim() ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            {saving ? (
              <><svg style={{ animation: "spin 0.8s linear infinite", width: "15px", height: "15px" }} viewBox="0 0 24 24" fill="none"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path style={{ opacity: 0.75 }} fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>Saving...</>
            ) : isEdit ? "Save Changes" : "Add Movie"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN PANEL ───────────────────────────────────────────────
export default function AdminPanel() {
  const navigate       = useNavigate();
  const { token, user } = useSelector(s => s.auth);
  const [tab,       setTab]       = useState("dashboard"); // dashboard | users | movies
  const [stats,     setStats]     = useState(null);
  const [users,     setUsers]     = useState([]);
  const [movies,    setMovies]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [toast,     setToast]     = useState(null);
  const [confirm,   setConfirm]   = useState(null); // { msg, onConfirm }
  const [movieForm, setMovieForm] = useState(null); // null | {} | movie obj
  const toastRef = useRef(null);

  const showToast = (msg, type = "success") => {
    clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  };

  // ── Auth guard ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (user && !user.isAdmin && user.role !== "admin") {
      navigate("/");
      return;
    }
    window.scrollTo(0, 0);
    loadAll();
  }, [token]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, m] = await Promise.all([
        api("/api/admin/stats",  "GET", null, token),
        api("/api/admin/users",  "GET", null, token),
        api("/api/admin/movies", "GET", null, token),
      ]);
      if (s.success !== false) setStats(s.stats || s);
      if (u.success !== false) setUsers(u.users || u);
      if (m.success !== false) setMovies(m.movies || m);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── User actions ────────────────────────────────────────────
  const toggleAdmin = async (uid, isAdmin) => {
    const data = await api(`/api/admin/users/${uid}`, "PATCH", { isAdmin: !isAdmin }, token);
    if (data.success) {
      setUsers(prev => prev.map(u => u._id === uid ? { ...u, isAdmin: !isAdmin } : u));
      showToast(`User ${!isAdmin ? "promoted to" : "removed from"} admin`);
    } else showToast(data.message || "Failed", "error");
  };

  const deleteUser = (uid, uname) => {
    setConfirm({
      msg: `Delete user "${uname}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        const data = await api(`/api/admin/users/${uid}`, "DELETE", null, token);
        if (data.success) {
          setUsers(prev => prev.filter(u => u._id !== uid));
          showToast("User deleted");
        } else showToast(data.message || "Failed", "error");
      },
    });
  };

  // ── Movie actions ───────────────────────────────────────────
  const saveMovie = async (form, isEdit) => {
    const path   = isEdit ? `/api/admin/movies/${form._id}` : "/api/admin/movies";
    const method = isEdit ? "PUT" : "POST";
    const data   = await api(path, method, form, token);
    if (data.success !== false && (data._id || data.movie)) {
      const saved = data.movie || data;
      if (isEdit) setMovies(prev => prev.map(m => m._id === saved._id ? saved : m));
      else        setMovies(prev => [saved, ...prev]);
      showToast(isEdit ? "Movie updated" : "Movie added");
      setMovieForm(null);
    } else showToast(data.message || "Failed to save", "error");
  };

  const deleteMovie = (mid, mtitle) => {
    setConfirm({
      msg: `Delete "${mtitle}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        const data = await api(`/api/admin/movies/${mid}`, "DELETE", null, token);
        if (data.success) {
          setMovies(prev => prev.filter(m => m._id !== mid));
          showToast("Movie deleted");
        } else showToast(data.message || "Failed", "error");
      },
    });
  };

  const toggleFeatured = async (mid, featured) => {
    const data = await api(`/api/admin/movies/${mid}`, "PATCH", { featured: !featured }, token);
    if (data.success !== false) {
      setMovies(prev => prev.map(m => m._id === mid ? { ...m, featured: !featured } : m));
      showToast(`Movie ${!featured ? "featured" : "unfeatured"}`);
    } else showToast("Failed", "error");
  };

  // ── Filtered lists ──────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredUsers  = users.filter(u =>
    u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  );
  const filteredMovies = movies.filter(m =>
    m.title?.toLowerCase().includes(q) || m.genre?.toLowerCase().includes(q)
  );

  // ── Tab nav ─────────────────────────────────────────────────
  const tabs = [
    { key: "dashboard", icon: "dashboard",   label: "Dashboard" },
    { key: "users",     icon: "group",        label: "Users",  count: users.length },
    { key: "movies",    icon: "movie",        label: "Movies", count: movies.length },
  ];

  const inputStyle = {
    width: "100%", backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
    color: "white", fontSize: "14px", padding: "10px 14px 10px 40px",
    fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#221011", fontFamily: "Inter, sans-serif", paddingTop: "80px" }}>
      <div className="adm-outer">

        {/* ── Page title ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "5px", height: "36px", backgroundColor: "#f20d18", borderRadius: "3px" }} />
            <div>
              <h1 style={{ color: "white", fontSize: "28px", fontWeight: "900" }}>Admin Panel</h1>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>Manage your platform</p>
            </div>
          </div>
          <button onClick={loadAll} style={{
            display: "flex", alignItems: "center", gap: "6px",
            backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)", borderRadius: "10px", padding: "9px 18px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>refresh</span>
            Refresh
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "0" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }} style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "10px 20px", borderRadius: "10px 10px 0 0",
              backgroundColor: tab === t.key ? "#2a1010" : "transparent",
              border: "none",
              borderBottom: tab === t.key ? "2px solid #f20d18" : "2px solid transparent",
              color: tab === t.key ? "white" : "rgba(255,255,255,0.4)",
              fontSize: "14px", fontWeight: tab === t.key ? "700" : "500",
              cursor: "pointer", fontFamily: "Inter, sans-serif",
              transition: "all 0.2s",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{t.icon}</span>
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  backgroundColor: tab === t.key ? "rgba(242,13,24,0.2)" : "rgba(255,255,255,0.08)",
                  color: tab === t.key ? "#fca5a5" : "rgba(255,255,255,0.3)",
                  fontSize: "11px", fontWeight: "700",
                  padding: "1px 7px", borderRadius: "20px",
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <svg style={{ animation: "spin 0.8s linear infinite", width: "40px", height: "40px", margin: "0 auto", display: "block", marginBottom: "16px" }} viewBox="0 0 24 24" fill="none">
              <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="#f20d18" strokeWidth="4"/>
              <path style={{ opacity: 0.8 }} fill="#f20d18" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>Loading admin data...</p>
          </div>
        ) : (
          <>
            {/* ══════════════ DASHBOARD ══════════════ */}
            {tab === "dashboard" && (
              <div>
                <div className="stats-grid">
                  <StatCard icon="group"       label="Total Users"   value={stats?.totalUsers || users.length}  color="#60a5fa" sub="Registered accounts" />
                  <StatCard icon="movie"       label="Total Movies"  value={stats?.totalMovies || movies.length} color="#f20d18" sub="In database" />
                  <StatCard icon="star"        label="Featured"      value={stats?.featuredMovies ?? movies.filter(m => m.featured).length} color="#fbbf24" sub="Movies" />
                  <StatCard icon="shield_person" label="Admins"      value={stats?.totalAdmins ?? users.filter(u => u.isAdmin).length} color="#34d399" sub="Admin users" />
                </div>

                {/* Recent users */}
                <div style={{ marginTop: "36px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h2 style={{ color: "white", fontSize: "17px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="material-symbols-outlined" style={{ color: "#60a5fa", fontSize: "20px" }}>group</span>
                      Recent Users
                    </h2>
                    <button onClick={() => setTab("users")} style={{
                      color: "#f20d18", fontSize: "13px", fontWeight: "600",
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: "4px",
                    }}>View all <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span></button>
                  </div>
                  <div style={{ backgroundColor: "#2a1010", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                    {users.slice(0, 5).map((u, i) => (
                      <div key={u._id} style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "14px 18px",
                        borderBottom: i < Math.min(users.length, 5) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          backgroundColor: u.isAdmin ? "rgba(52,211,153,0.15)" : "rgba(96,165,250,0.12)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: u.isAdmin ? "#34d399" : "#60a5fa" }}>
                            {u.isAdmin ? "shield_person" : "person"}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: "white", fontSize: "14px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</p>
                          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                        </div>
                        {u.isAdmin && (
                          <span style={{ backgroundColor: "rgba(52,211,153,0.1)", color: "#34d399", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", letterSpacing: "0.5px" }}>ADMIN</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent movies */}
                <div style={{ marginTop: "32px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h2 style={{ color: "white", fontSize: "17px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="material-symbols-outlined" style={{ color: "#f20d18", fontSize: "20px" }}>movie</span>
                      Recent Movies
                    </h2>
                    <button onClick={() => setTab("movies")} style={{
                      color: "#f20d18", fontSize: "13px", fontWeight: "600",
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: "4px",
                    }}>View all <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span></button>
                  </div>
                  <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: "none" }}>
                    {movies.slice(0, 8).map(m => (
                      <div key={m._id} style={{ flexShrink: 0, width: "110px" }}>
                        <img src={m.poster || FALLBACK_POSTER} alt={m.title}
                          style={{ width: "110px", height: "165px", objectFit: "cover", borderRadius: "10px", display: "block" }}
                          onError={e => e.target.src = FALLBACK_POSTER}
                        />
                        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: "600", marginTop: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                      </div>
                    ))}
                    {movies.length === 0 && (
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", padding: "20px 0" }}>No movies added yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ USERS ══════════════ */}
            {tab === "users" && (
              <div>
                {/* Search */}
                <div style={{ position: "relative", maxWidth: "400px", marginBottom: "20px" }}>
                  <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: "18px", pointerEvents: "none" }}>search</span>
                  <input
                    style={inputStyle}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search users..."
                  />
                </div>

                {/* Table */}
                <div style={{ backgroundColor: "#2a1010", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {/* Header */}
                  <div className="adm-table-head">
                    <span>User</span>
                    <span className="adm-hide-sm">Email</span>
                    <span>Role</span>
                    <span style={{ textAlign: "right" }}>Actions</span>
                  </div>
                  {/* Rows */}
                  {filteredUsers.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>No users found</div>
                  ) : filteredUsers.map((u, i) => (
                    <div key={u._id} className="adm-table-row" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      {/* Avatar + name */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <div style={{
                          width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                          backgroundColor: u.isAdmin ? "rgba(52,211,153,0.12)" : "rgba(96,165,250,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "17px", color: u.isAdmin ? "#34d399" : "#60a5fa" }}>
                            {u.isAdmin ? "shield_person" : "person"}
                          </span>
                        </div>
                        <span style={{ color: "white", fontSize: "14px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</span>
                      </div>

                      {/* Email */}
                      <span className="adm-hide-sm" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>

                      {/* Role badge */}
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        backgroundColor: u.isAdmin ? "rgba(52,211,153,0.1)" : "rgba(96,165,250,0.08)",
                        color: u.isAdmin ? "#34d399" : "#93c5fd",
                        fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px",
                        letterSpacing: "0.5px", width: "fit-content",
                      }}>{u.isAdmin ? "ADMIN" : "USER"}</span>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => toggleAdmin(u._id, u.isAdmin)}
                          title={u.isAdmin ? "Remove admin" : "Make admin"}
                          style={{
                            padding: "6px 12px", borderRadius: "8px", cursor: "pointer",
                            backgroundColor: u.isAdmin ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${u.isAdmin ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.1)"}`,
                            color: u.isAdmin ? "#34d399" : "rgba(255,255,255,0.5)",
                            fontSize: "12px", fontWeight: "600", fontFamily: "Inter, sans-serif",
                            display: "flex", alignItems: "center", gap: "4px",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                            {u.isAdmin ? "shield" : "shield_person"}
                          </span>
                          <span className="adm-hide-sm">{u.isAdmin ? "Revoke" : "Promote"}</span>
                        </button>
                        <button
                          onClick={() => deleteUser(u._id, u.username)}
                          title="Delete user"
                          style={{
                            width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer",
                            backgroundColor: "rgba(242,13,24,0.08)",
                            border: "1px solid rgba(242,13,24,0.15)",
                            color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "12px" }}>
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>
            )}

            {/* ══════════════ MOVIES ══════════════ */}
            {tab === "movies" && (
              <div>
                {/* Toolbar */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "360px" }}>
                    <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: "18px", pointerEvents: "none" }}>search</span>
                    <input
                      style={inputStyle}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search movies..."
                    />
                  </div>
                  <button
                    onClick={() => setMovieForm({})}
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      backgroundColor: "#f20d18", border: "none",
                      color: "white", borderRadius: "12px",
                      padding: "10px 20px", fontSize: "14px", fontWeight: "700",
                      cursor: "pointer", fontFamily: "Inter, sans-serif",
                      boxShadow: "0 4px 18px rgba(242,13,24,0.3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                    Add Movie
                  </button>
                </div>

                {/* Movie list */}
                <div style={{ backgroundColor: "#2a1010", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="adm-table-head">
                    <span>Movie</span>
                    <span className="adm-hide-sm">Genre</span>
                    <span className="adm-hide-sm">Year</span>
                    <span>Featured</span>
                    <span style={{ textAlign: "right" }}>Actions</span>
                  </div>
                  {filteredMovies.length === 0 ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "rgba(242,13,24,0.2)", display: "block", marginBottom: "12px" }}>movie_off</span>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>{movies.length === 0 ? "No movies added yet" : "No movies match your search"}</p>
                    </div>
                  ) : filteredMovies.map((m, i) => (
                    <div key={m._id} className="adm-table-row" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      {/* Poster + title */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                        <img src={m.poster || FALLBACK_POSTER} alt={m.title}
                          style={{ width: "36px", height: "54px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                          onError={e => e.target.src = FALLBACK_POSTER}
                        />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ color: "white", fontSize: "14px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                          {m.rating && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>⭐ {m.rating}</p>}
                        </div>
                      </div>

                      {/* Genre */}
                      <span className="adm-hide-sm" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{m.genre || "—"}</span>

                      {/* Year */}
                      <span className="adm-hide-sm" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{m.releaseYear || "—"}</span>

                      {/* Featured toggle */}
                      <div
                        onClick={() => toggleFeatured(m._id, m.featured)}
                        style={{
                          width: "38px", height: "22px", borderRadius: "11px",
                          backgroundColor: m.featured ? "#f20d18" : "rgba(255,255,255,0.1)",
                          position: "relative", cursor: "pointer", transition: "background 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        <div style={{
                          position: "absolute", top: "3px",
                          left: m.featured ? "19px" : "3px",
                          width: "16px", height: "16px",
                          borderRadius: "50%", backgroundColor: "white",
                          transition: "left 0.2s",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                        }} />
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setMovieForm(m)}
                          title="Edit"
                          style={{
                            width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer",
                            backgroundColor: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                        </button>
                        <button
                          onClick={() => deleteMovie(m._id, m.title)}
                          title="Delete"
                          style={{
                            width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer",
                            backgroundColor: "rgba(242,13,24,0.08)",
                            border: "1px solid rgba(242,13,24,0.15)",
                            color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "12px" }}>
                  Showing {filteredMovies.length} of {movies.length} movies
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals & overlays */}
      {confirm   && <ConfirmModal msg={confirm.msg} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      {movieForm !== null && <MovieFormModal initial={movieForm._id ? movieForm : null} onSave={saveMovie} onClose={() => setMovieForm(null)} />}
      {toast     && <Toast msg={toast.msg} type={toast.type} />}

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        * { box-sizing: border-box; }

        .adm-outer { max-width: 1200px; margin: 0 auto; padding: 0 40px 80px; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .adm-table-head {
          display: grid;
          grid-template-columns: 2fr 1.2fr 0.7fr 0.7fr 1fr;
          gap: 12px;
          padding: 12px 18px;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.35);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.7px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .adm-table-row {
          display: grid;
          grid-template-columns: 2fr 1.2fr 0.7fr 0.7fr 1fr;
          gap: 12px;
          padding: 12px 18px;
          align-items: center;
          transition: background 0.15s;
        }
        .adm-table-row:hover { background: rgba(255,255,255,0.03); }

        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .adm-outer { padding: 0 16px 60px; }
          .adm-outer h1 { font-size: 22px !important; }
          .adm-hide-sm { display: none !important; }
          .adm-table-head, .adm-table-row { grid-template-columns: 2fr 0.7fr 0.9fr; }
        }
        @media (max-width: 500px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }

        input:focus, textarea:focus { border-color: rgba(242,13,24,0.5) !important; background: rgba(242,13,24,0.04) !important; }
        *::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
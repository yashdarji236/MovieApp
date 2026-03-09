import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user }  = useSelector(s => s.auth);

  // ── ALL hooks must be declared before any early return ──
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [userMenu,  setUserMenu]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Early return AFTER all hooks ──
  const hideNav = ["/login", "/signup"].includes(location.pathname);
  if (hideNav) return null;

  const handleLogout = () => {
    dispatch(logout());
    setUserMenu(false);
    navigate("/login");
  };

  const navLinks = [
    { label: "Home",     path: "/" },
    { label: "Movies",   path: "/movies" },
    { label: "TV Shows", path: "/tv" },
    { label: "Search",   path: "/search" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: scrolled ? "rgba(34,16,17,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(242,13,24,0.1)" : "none",
        transition: "all 0.3s ease",
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{
          maxWidth: "1400px", margin: "0 auto",
          padding: "0 32px", height: "64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px", backgroundColor: "#f20d18",
              borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "white" }}>movie_filter</span>
            </div>
            <span style={{ color: "white", fontWeight: "700", fontSize: "17px" }}>Cinematic</span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }} className="desktop-nav">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} style={{
                color: isActive(link.path) ? "#f20d18" : "rgba(255,255,255,0.65)",
                textDecoration: "none", fontSize: "14px", fontWeight: "500",
                padding: "8px 14px", borderRadius: "8px",
                backgroundColor: isActive(link.path) ? "rgba(242,13,24,0.1)" : "transparent",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { if (!isActive(link.path)) e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { if (!isActive(link.path)) e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            {/* Search */}
            <Link to="/search" style={{
              color: "rgba(255,255,255,0.6)", padding: "8px",
              display: "flex", alignItems: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>search</span>
            </Link>

            {user ? (
              <>
                {/* Favorites */}
                <Link to="/favorites" style={{
                  color: "rgba(255,255,255,0.6)", padding: "8px",
                  display: "flex", alignItems: "center",
                }} className="desktop-only">
                  <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>favorite</span>
                </Link>

                {/* User avatar dropdown */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      backgroundColor: "#f20d18", border: "2px solid rgba(255,255,255,0.2)",
                      color: "white", fontWeight: "700", fontSize: "14px",
                      cursor: "pointer", fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {user.username?.charAt(0).toUpperCase()}
                  </button>

                  {userMenu && (
                    <>
                      {/* Backdrop to close */}
                      <div
                        onClick={() => setUserMenu(false)}
                        style={{ position: "fixed", inset: 0, zIndex: 90 }}
                      />
                      <div style={{
                        position: "absolute", right: 0, top: "44px",
                        width: "210px", backgroundColor: "#2a1010",
                        border: "1px solid rgba(242,13,24,0.2)",
                        borderRadius: "12px", overflow: "hidden",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                        zIndex: 100,
                      }}>
                        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          <p style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>{user.username}</p>
                          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "2px" }}>{user.email}</p>
                        </div>

                        {user.role === "admin" && (
                          <Link to="/admin" onClick={() => setUserMenu(false)} style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "11px 16px", color: "rgba(255,255,255,0.7)",
                            textDecoration: "none", fontSize: "13px",
                            transition: "background 0.2s",
                          }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#f20d18" }}>admin_panel_settings</span>
                            Admin Panel
                          </Link>
                        )}

                        <Link to="/favorites" onClick={() => setUserMenu(false)} style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "11px 16px", color: "rgba(255,255,255,0.7)",
                          textDecoration: "none", fontSize: "13px",
                        }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#f20d18" }}>favorite</span>
                          Favorites
                        </Link>

                        <Link to="/history" onClick={() => setUserMenu(false)} style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "11px 16px", color: "rgba(255,255,255,0.7)",
                          textDecoration: "none", fontSize: "13px",
                        }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#f20d18" }}>history</span>
                          Watch History
                        </Link>

                        <button onClick={handleLogout} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "10px",
                          padding: "11px 16px", color: "#f87171", fontSize: "13px",
                          background: "none", border: "none", cursor: "pointer",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                          fontFamily: "Inter, sans-serif", textAlign: "left",
                        }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.08)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link to="/login" style={{
                  backgroundColor: "#f20d18", color: "white",
                  textDecoration: "none", fontSize: "14px", fontWeight: "700",
                  padding: "8px 18px", borderRadius: "8px",
                }}>Log In</Link>
          
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-btn"
              style={{
                background: "none", border: "none", color: "white",
                cursor: "pointer", padding: "8px", display: "none",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                {menuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            backgroundColor: "rgba(34,16,17,0.98)",
            borderTop: "1px solid rgba(242,13,24,0.1)",
            padding: "12px 16px 20px",
          }}>
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block", padding: "12px 16px",
                  color: isActive(link.path) ? "#f20d18" : "rgba(255,255,255,0.7)",
                  textDecoration: "none", fontSize: "15px", fontWeight: "500",
                  borderRadius: "8px", marginBottom: "4px",
                  backgroundColor: isActive(link.path) ? "rgba(242,13,24,0.1)" : "transparent",
                }}
              >{link.label}</Link>
            ))}
            {user && (
              <button onClick={handleLogout} style={{
                width: "100%", textAlign: "left", padding: "12px 16px",
                color: "#f87171", background: "none", border: "none",
                fontSize: "15px", fontWeight: "500", cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}>Logout</button>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav    { display: none !important; }
          .desktop-only   { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
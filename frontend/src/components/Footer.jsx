import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    Explore: [
      { label: "Home",        path: "/" },
      { label: "Movies",      path: "/movies" },
      { label: "TV Shows",    path: "/tv" },
      { label: "Search",      path: "/search" },
    ],
    Account: [
      { label: "Login",       path: "/login" },
      { label: "Register",    path: "/signup" },
      { label: "Favorites",   path: "/favorites" },
      { label: "Watch History", path: "/history" },
    ],
  };

  const socials = [
    { icon: "language",  href: "#", label: "Website" },
    { icon: "mail",      href: "#", label: "Email" },
    { icon: "rss_feed",  href: "#", label: "RSS" },
  ];

  return (
    <footer style={{
      backgroundColor: "#160808",
      borderTop: "1px solid rgba(242,13,24,0.12)",
      fontFamily: "Inter, sans-serif",
      paddingTop: "56px",
    }}>
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "0 40px",
      }}>

        {/* ── Top section ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "48px",
          paddingBottom: "48px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }} className="footer-grid">

          {/* Brand column */}
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: "38px", height: "38px", backgroundColor: "#f20d18",
                borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "white" }}>movie_filter</span>
              </div>
              <span style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>Cinematic</span>
            </div>

            {/* Tagline */}
            <p style={{
              color: "rgba(255,255,255,0.4)", fontSize: "14px",
              lineHeight: "1.7", maxWidth: "300px", marginBottom: "24px",
            }}>
              Your ultimate destination for movies, TV shows, trailers, and cinematic experiences. Discover, watch, and enjoy.
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "10px" }}>
              {socials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  backgroundColor: "rgba(242,13,24,0.1)",
                  border: "1px solid rgba(242,13,24,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.5)", textDecoration: "none",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = "#f20d18";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderColor = "#f20d18";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = "rgba(242,13,24,0.1)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    e.currentTarget.style.borderColor = "rgba(242,13,24,0.2)";
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 style={{
                color: "white", fontSize: "13px", fontWeight: "700",
                letterSpacing: "1.5px", textTransform: "uppercase",
                marginBottom: "20px",
              }}>
                {heading}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {items.map(item => (
                  <li key={item.path}>
                    <Link to={item.path} style={{
                      color: "rgba(255,255,255,0.45)", fontSize: "14px",
                      textDecoration: "none", transition: "color 0.2s",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = "#f20d18"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── TMDB Credit ── */}
        <div style={{
          padding: "20px 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
            Powered by
          </span>
          <span style={{
            backgroundColor: "rgba(1,180,228,0.15)",
            border: "1px solid rgba(1,180,228,0.25)",
            color: "#01b4e4", fontSize: "12px", fontWeight: "700",
            padding: "3px 10px", borderRadius: "6px", letterSpacing: "0.5px",
          }}>
            TMDB API
          </span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>
            — This product uses the TMDB API but is not endorsed or certified by TMDB.
          </span>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          padding: "20px 0 28px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
        }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
            © {currentYear} Cinematic. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy Policy", "Terms of Service"].map(t => (
              <a key={t} href="#" style={{
                color: "rgba(255,255,255,0.25)", fontSize: "13px",
                textDecoration: "none", transition: "color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // ── Log what we're sending ─────────────────────────────────
    console.log("Sending signup request:", form);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          email:    form.email.trim(),
          password: form.password,
        }),
      });

      // ── Log raw response ───────────────────────────────────
      console.log("Response status:", response.status);

      const data = await response.json();

      // ── Log parsed data ────────────────────────────────────
      console.log("Response data:", data);

      if (!data.success) {
        setError(data.message || "Signup failed");
        setIsLoading(false);
        return;
      }

      // ── Success ────────────────────────────────────────────
      dispatch(setCredentials({ user: data.user, token: data.token }));
      navigate("/");

    } catch (err) {
      // ── Log actual error ───────────────────────────────────
      console.error("Fetch error:", err);
      setError(`Request failed: ${err.message}`);
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: "52px",
    backgroundColor: "rgba(242,13,24,0.07)",
    border: "1px solid rgba(242,13,24,0.25)",
    borderRadius: "12px",
    color: "#f1f5f9",
    fontSize: "15px",
    paddingLeft: "48px",
    paddingRight: "16px",
    outline: "none",
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#221011",
      fontFamily: "Inter, sans-serif",
      display: "flex",
      flexDirection: "row",
    }}>

      {/* ══ LEFT 50%: Cinema Image ══ */}
      <div style={{
        width: "50%",
        position: "relative",
        minHeight: "100vh",
        flexShrink: 0,
        display: "none",
      }} className="lg-image-panel">
        <img
          src="https://i.pinimg.com/736x/e4/5c/ba/e45cba8b65b3f7c57672ebb7a4363334.jpg"
          alt="Cinema"
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            display: "block", position: "absolute", top: 0, left: 0,
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(34,16,17,0.1) 60%, #221011 100%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", bottom: "40px", left: "36px", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div style={{
              width: "44px", height: "44px", backgroundColor: "#f20d18",
              borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "white" }}>movie_filter</span>
            </div>
            <span style={{ color: "white", fontSize: "22px", fontWeight: "700" }}>Cinematic</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", lineHeight: "1.7", maxWidth: "280px" }}>
            Your ultimate destination for movies,<br />trailers, and cinematic experiences.
          </p>
        </div>
      </div>

      {/* ══ RIGHT: Form ══ */}
      <div style={{
        width: "100%", minHeight: "100vh",
        display: "flex", flexDirection: "column", overflowY: "auto",
      }} className="form-panel">

        {/* Mobile hero */}
        <div className="mobile-hero" style={{ position: "relative", height: "220px", flexShrink: 0 }}>
          <img
            src="https://i.pinimg.com/736x/e4/5c/ba/e45cba8b65b3f7c57672ebb7a4363334.jpg"
            alt="Cinema"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(34,16,17,0.2) 0%, rgba(34,16,17,0.5) 60%, #221011 100%)",
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px",
          }}>
            <div style={{ color: "#f20d18" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>movie_filter</span>
            </div>
            <span style={{ color: "white", fontWeight: "700", fontSize: "17px" }}>Cinematic</span>
            <div style={{ width: "32px" }} />
          </div>
        </div>

        {/* Desktop logo */}
        <div className="desktop-logo" style={{ display: "none", alignItems: "center", justifyContent: "flex-end", padding: "28px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", backgroundColor: "#f20d18",
              borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "white" }}>movie_filter</span>
            </div>
            <span style={{ color: "white", fontWeight: "700", fontSize: "17px" }}>Cinematic</span>
          </div>
        </div>

        {/* Form content */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "40px 32px", maxWidth: "440px", width: "100%", margin: "0 auto",
        }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ color: "white", fontSize: "30px", fontWeight: "800", marginBottom: "8px", lineHeight: "1.2" }}>
              Join the Premiere
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Create your account to get started.</p>
          </div>

          {/* Error box — shows actual error message */}
          {error && (
            <div style={{
              marginBottom: "20px", padding: "12px 16px", borderRadius: "10px",
              backgroundColor: "rgba(242,13,24,0.12)", border: "1px solid rgba(242,13,24,0.3)",
              color: "#fca5a5", fontSize: "14px",
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  color: "#64748b", fontSize: "19px", pointerEvents: "none", lineHeight: "1",
                }}>person</span>
                <input
                  type="text" name="username" value={form.username}
                  onChange={handleChange} placeholder="Choose a username" required
                  style={inputStyle}
                  onFocus={e => e.target.style.border = "1.5px solid #f20d18"}
                  onBlur={e => e.target.style.border = "1px solid rgba(242,13,24,0.25)"}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  color: "#64748b", fontSize: "19px", pointerEvents: "none", lineHeight: "1",
                }}>mail</span>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="Enter your email" required
                  style={inputStyle}
                  onFocus={e => e.target.style.border = "1.5px solid #f20d18"}
                  onBlur={e => e.target.style.border = "1px solid rgba(242,13,24,0.25)"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  color: "#64748b", fontSize: "19px", pointerEvents: "none", lineHeight: "1",
                }}>lock</span>
                <input
                  type={showPassword ? "text" : "password"} name="password" value={form.password}
                  onChange={handleChange} placeholder="Min. 6 characters" required
                  style={{ ...inputStyle, paddingRight: "48px" }}
                  onFocus={e => e.target.style.border = "1.5px solid #f20d18"}
                  onBlur={e => e.target.style.border = "1px solid rgba(242,13,24,0.25)"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#64748b", display: "flex", alignItems: "center", padding: 0,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={{
              width: "100%", height: "52px", backgroundColor: "#f20d18",
              border: "none", borderRadius: "12px", color: "white",
              fontSize: "16px", fontWeight: "700",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 6px 24px rgba(242,13,24,0.3)",
              fontFamily: "Inter, sans-serif",
              opacity: isLoading ? 0.7 : 1,
              transition: "background-color 0.2s",
            }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = "#d10b15"; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = "#f20d18"; }}
            >
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <svg style={{ animation: "spin 1s linear infinite", width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account...
                </span>
              ) : "Register"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#64748b", fontSize: "13px", marginTop: "24px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#f20d18", fontWeight: "700", textDecoration: "none" }}>
              Log In
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input::placeholder { color: #475569 !important; }
        * { box-sizing: border-box; }
        @media (min-width: 1024px) {
          .lg-image-panel { display: block !important; }
          .form-panel { width: 50% !important; }
          .mobile-hero { display: none !important; }
          .desktop-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
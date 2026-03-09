import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar      from "./components/Navbar";
import Footer      from "./components/Footer";
import Home        from "./pages/Home";
import Login       from "./pages/Login";
import Signup      from "./pages/Signup";
import Movies      from "./pages/Movies";
import TVShows     from "./pages/TVShows";
import Search      from "./pages/Search";
import Favorites   from "./pages/Favorites";
import WatchHistory from "./pages/Watchhistory";
import AdminPanel   from "./pages/AdminPanel";
import MovieDetail from "./pages/MovieDetail";

const ComingSoon = ({ title }) => (
  <div style={{
    minHeight: "100vh", backgroundColor: "#221011",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexDirection: "column", gap: "16px", paddingTop: "80px",
    fontFamily: "Inter, sans-serif",
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#f20d18" }}>movie_filter</span>
    <h1 style={{ color: "white", fontSize: "32px", fontWeight: "800", letterSpacing: "2px" }}>{title}</h1>
    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Coming Soon</p>
  </div>
);

export default function App() {
  const location   = useLocation();
  const hideLayout = ["/login", "/signup"].includes(location.pathname);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#221011" }}>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />}        />
        <Route path="/movies"    element={<Movies />}      />
        <Route path="/tv"        element={<TVShows />}     />
        <Route path="/search"    element={<Search />}                           />
        <Route path="/favorites" element={<Favorites />}     />
        <Route path="/history"   element={<WatchHistory />}  />
        <Route path="/admin"     element={<AdminPanel />}   />
        <Route path="/login"     element={<Login />}   />
        <Route path="/signup"    element={<Signup />}  />
        {/* dynamic id routes last */}
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv/:id"    element={<MovieDetail />} />
      </Routes>
      {!hideLayout && <Footer />}
    </div>
  );
}
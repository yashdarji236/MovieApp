const express      = require("express");
const dotenv       = require("dotenv");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const connectDB    = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Allow BOTH port 3000 and 5173 (Vite default) ─────────────
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Routes ───────────────────────────────────────────────────
const authRoutes  = require("./routes/authRoutes");
const userRoutes  = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const movieRoutes = require("./routes/movieRoutes");

app.use("/api/auth",   authRoutes);
app.use("/api/users",  userRoutes);
app.use("/api/admin",  adminRoutes);
app.use("/api/movies", movieRoutes);

// ─── Base Route ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎬 Movie Platform API is running!",
    version: "1.0.0",
    endpoints: {
      auth:   "/api/auth",
      users:  "/api/users",
      movies: "/api/movies",
      admin:  "/api/admin",
    },
  });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
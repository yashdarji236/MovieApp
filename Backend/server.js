const express      = require("express");
const dotenv       = require("dotenv");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const connectDB    = require("./config/db");
const path         = require("path");

dotenv.config();
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Allow BOTH port 3000 and 5173 (Vite default) ─────────────
const allowedOrigins = [
  "https://movieapp-5n6c.onrender.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
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

// ─── Serve React Frontend ─────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ─── Catch-all: serve index.html for any non-API route ────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
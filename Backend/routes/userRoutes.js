// const express = require("express");
// const router = express.Router();
// const {
//   addToFavorites,
//   removeFromFavorites,
//   getFavorites,
//   addToWatchHistory,
//   getWatchHistory,
//   clearWatchHistory,
// } = require("../controllers/userController");
// const { protect } = require("../middleware/authMiddleware");

// // ─── All routes are Private (token required) ──────────────────

// // ─── Favorites Routes ─────────────────────────────────────────

// // @route   GET  /api/users/favorites
// // @desc    Get all favorite movies
// router.get("/favorites", protect, getFavorites);

// // @route   POST /api/users/favorites
// // @desc    Add a movie to favorites
// router.post("/favorites", protect, addToFavorites);

// // @route   DELETE /api/users/favorites/:movieId
// // @desc    Remove a movie from favorites
// router.delete("/favorites/:movieId", protect, removeFromFavorites);

// // ─── Watch History Routes ─────────────────────────────────────

// // @route   GET /api/users/history
// // @desc    Get watch history
// router.get("/history", protect, getWatchHistory);

// // @route   POST /api/users/history
// // @desc    Add a movie to watch history
// router.post("/history", protect, addToWatchHistory);

// // @route   DELETE /api/users/history
// // @desc    Clear all watch history
// router.delete("/history", protect, clearWatchHistory);

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  addToWatchHistory,
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// ─── All routes are Private (token required) ──────────────────

// ─── Favorites Routes ─────────────────────────────────────────
router.get("/favorites",            protect, getFavorites);
router.post("/favorites",           protect, addToFavorites);
router.delete("/favorites/:movieId",protect, removeFromFavorites);

// ─── Watch History Routes ─────────────────────────────────────
router.get("/history",              protect, getWatchHistory);
router.post("/history",             protect, addToWatchHistory);
router.delete("/history/:movieId",  protect, removeFromWatchHistory); // ← per-item delete FIRST
router.delete("/history",           protect, clearWatchHistory);       // ← clear all SECOND

module.exports = router;
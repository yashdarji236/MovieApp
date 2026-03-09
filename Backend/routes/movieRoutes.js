const express = require("express");
const router  = express.Router();

const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  toggleMovieStatus,
} = require("../controllers/movieController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ─── Public Routes (No token needed) ─────────────────────────

// @route   GET /api/movies
// @desc    Get all movies (filter by category, genre, search, page)
router.get("/", getAllMovies);

// @route   GET /api/movies/:id
// @desc    Get single movie by MongoDB _id
router.get("/:id", getMovieById);

// ─── Private Routes (Admin only) ──────────────────────────────

// @route   POST /api/movies
// @desc    Add a new movie
router.post("/", protect, adminOnly, createMovie);

// @route   PUT /api/movies/:id
// @desc    Update a movie
router.put("/:id", protect, adminOnly, updateMovie);

// @route   DELETE /api/movies/:id
// @desc    Delete a movie
router.delete("/:id", protect, adminOnly, deleteMovie);

// @route   PATCH /api/movies/:id/toggle
// @desc    Toggle movie active/inactive
router.patch("/:id/toggle", protect, adminOnly, toggleMovieStatus);

module.exports = router;
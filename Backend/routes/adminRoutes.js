const express = require("express");
const router  = express.Router();

const {
  getAllUsers,
  getUserById,
  banUser,
  unbanUser,
  deleteUser,
  promoteToAdmin,
  getDashboardStats,
} = require("../controllers/adminController");

const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  toggleMovieStatus,
} = require("../controllers/movieController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── All routes below are: Private + Admin only ────────────────
router.use(protect, adminOnly);

// ─── Dashboard ────────────────────────────────────────────────

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
router.get("/stats", getDashboardStats);

// ─── User Management ──────────────────────────────────────────

// @route   GET /api/admin/users
// @desc    Get all users (with search + pagination)
router.get("/users", getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get single user by ID
router.get("/users/:id", getUserById);

// @route   PATCH /api/admin/users/:id/ban
// @desc    Ban a user
router.patch("/users/:id/ban", banUser);

// @route   PATCH /api/admin/users/:id/unban
// @desc    Unban a user
router.patch("/users/:id/unban", unbanUser);

// @route   PATCH /api/admin/users/:id/promote
// @desc    Promote user to admin
router.patch("/users/:id/promote", promoteToAdmin);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user permanently
router.delete("/users/:id", deleteUser);

// ─── Movie Management ─────────────────────────────────────────

// @route   GET /api/admin/movies
// @desc    Get all movies (with filters + pagination)
router.get("/movies", getAllMovies);

// @route   GET /api/admin/movies/:id
// @desc    Get single movie
router.get("/movies/:id", getMovieById);

// @route   POST /api/admin/movies
// @desc    Add a new movie
router.post("/movies", createMovie);

// @route   PUT /api/admin/movies/:id
// @desc    Update a movie
router.put("/movies/:id", updateMovie);

// @route   DELETE /api/admin/movies/:id
// @desc    Delete a movie permanently
router.delete("/movies/:id", deleteMovie);

// @route   PATCH /api/admin/movies/:id/toggle
// @desc    Toggle movie active/inactive
router.patch("/movies/:id/toggle", toggleMovieStatus);

module.exports = router;
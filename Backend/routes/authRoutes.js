const express = require("express");
const router = express.Router();
const {
  signupUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// ─── Public Routes (No token needed) ─────────────────────────

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post("/signup", signupUser);

// @route   POST /api/auth/login
// @desc    Login user and get token
router.post("/login", loginUser);

// ─── Private Routes (Token required) ─────────────────────────

// @route   GET /api/auth/me
// @desc    Get current logged in user profile
router.get("/me", protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
router.post("/logout", protect, logoutUser);

module.exports = router;
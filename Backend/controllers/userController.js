const User = require("../models/User");

// ─── @desc    Add movie to favorites
// ─── @route   POST /api/users/favorites
// ─── @access  Private
const addToFavorites = async (req, res) => {
  try {
    const { movieId, title, poster, mediaType } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({
        success: false,
        message: "movieId and title are required",
      });
    }

    const user = await User.findById(req.user.id);

    // ── Check if already in favorites ─────────────────────────
    const alreadyAdded = user.favorites.find((f) => f.movieId === movieId);
    if (alreadyAdded) {
      return res.status(400).json({
        success: false,
        message: "Movie already in favorites",
      });
    }

    // ── Push new favorite ──────────────────────────────────────
    user.favorites.push({
      movieId,
      title,
      poster: poster || "https://via.placeholder.com/300x450?text=No+Poster",
      mediaType: mediaType || "movie",
      addedAt: Date.now(),
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: `"${title}" added to favorites`,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Add Favorite Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error adding to favorites",
      error: error.message,
    });
  }
};

// ─── @desc    Remove movie from favorites
// ─── @route   DELETE /api/users/favorites/:movieId
// ─── @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const { movieId } = req.params;

    const user = await User.findById(req.user.id);

    // ── Check if movie exists in favorites ────────────────────
    const exists = user.favorites.find((f) => f.movieId === movieId);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Movie not found in favorites",
      });
    }

    // ── Filter out the movie ───────────────────────────────────
    user.favorites = user.favorites.filter((f) => f.movieId !== movieId);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Movie removed from favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Remove Favorite Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error removing from favorites",
      error: error.message,
    });
  }
};

// ─── @desc    Get all favorites
// ─── @route   GET /api/users/favorites
// ─── @access  Private
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Get Favorites Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching favorites",
      error: error.message,
    });
  }
};

// ─── @desc    Add movie to watch history
// ─── @route   POST /api/users/history
// ─── @access  Private
const addToWatchHistory = async (req, res) => {
  try {
    const { movieId, title, poster, mediaType } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({
        success: false,
        message: "movieId and title are required",
      });
    }

    const user = await User.findById(req.user.id);

    // ── Remove if already exists (to avoid duplicates) ────────
    // Then re-add at the top so it becomes "most recently watched"
    user.watchHistory = user.watchHistory.filter((h) => h.movieId !== movieId);

    // ── Add to beginning of array (most recent first) ─────────
    user.watchHistory.unshift({
      movieId,
      title,
      poster: poster || "https://via.placeholder.com/300x450?text=No+Poster",
      mediaType: mediaType || "movie",
      watchedAt: Date.now(),
    });

    // ── Keep only last 20 watched movies ──────────────────────
    if (user.watchHistory.length > 20) {
      user.watchHistory = user.watchHistory.slice(0, 20);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `"${title}" added to watch history`,
      watchHistory: user.watchHistory,
    });
  } catch (error) {
    console.error("Add Watch History Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error adding to watch history",
      error: error.message,
    });
  }
};

// ─── @desc    Get watch history
// ─── @route   GET /api/users/history
// ─── @access  Private
const getWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      count: user.watchHistory.length,
      watchHistory: user.watchHistory,
    });
  } catch (error) {
    console.error("Get Watch History Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching watch history",
      error: error.message,
    });
  }
};

// ─── @desc    Remove single movie from watch history
// ─── @route   DELETE /api/users/history/:movieId
// ─── @access  Private
const removeFromWatchHistory = async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);

    const exists = user.watchHistory.find((h) => h.movieId === movieId);
    if (!exists) {
      return res.status(404).json({ success: false, message: "Movie not found in history" });
    }

    user.watchHistory = user.watchHistory.filter((h) => h.movieId !== movieId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Removed from watch history",
      watchHistory: user.watchHistory,
    });
  } catch (error) {
    console.error("Remove History Error:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Clear all watch history
// ─── @route   DELETE /api/users/history
// ─── @access  Private
const clearWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.watchHistory = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Watch history cleared",
    });
  } catch (error) {
    console.error("Clear History Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error clearing watch history",
      error: error.message,
    });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  addToWatchHistory,
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
};
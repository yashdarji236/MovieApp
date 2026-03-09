const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
    },

    movieId: {
      type: String,
      required: [true, "Movie ID is required"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "Description not available",
      trim: true,
    },

    // ─── Media ────────────────────────────────────────────────
    poster: {
      type: String,
      default: "https://via.placeholder.com/300x450?text=No+Poster", // Fallback image
    },

    trailer: {
      type: String, // YouTube video ID or full URL
      default: null,
    },

    // ─── Details ──────────────────────────────────────────────
    releaseDate: {
      type: Date,
      default: null,
    },

    genre: [
      {
        type: String,
        trim: true,
      },
    ],

    category: {
      type: String,
      enum: ["movie", "tv", "trending", "popular", "upcoming"],
      default: "movie",
    },

    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },

    language: {
      type: String,
      default: "en",
    },

    // ─── Source ───────────────────────────────────────────────
    // Tracks if movie was added by admin manually or fetched from TMDB
    source: {
      type: String,
      enum: ["tmdb", "admin"],
      default: "admin",
    },

    // ─── Admin Tracking ───────────────────────────────────────
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true, // Admin can deactivate a movie without deleting
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Index for faster search queries ──────────────────────────
movieSchema.index({ title: "text", description: "text" });

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
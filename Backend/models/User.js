const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },

    // ─── Profile ──────────────────────────────────────────────
    avatar: {
      type: String,
      default: "https://www.gravatar.com/avatar/?d=mp", // Default avatar
    },

    // ─── Role ─────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ─── Account Status ───────────────────────────────────────
    isBanned: {
      type: Boolean,
      default: false,
    },

    // ─── Movie Preferences ────────────────────────────────────
    favorites: [
      {
        movieId: { type: String, required: true },   // TMDB movie ID
        title: { type: String },
        poster: { type: String },
        mediaType: { type: String, enum: ["movie", "tv"], default: "movie" },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    watchHistory: [
      {
        movieId: { type: String, required: true },   // TMDB movie ID
        title: { type: String },
        poster: { type: String },
        mediaType: { type: String, enum: ["movie", "tv"], default: "movie" },
        watchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Hash Password Before Saving ──────────────────────────────
// This runs automatically before every .save() call
userSchema.pre("save", async function (next) {
  // Only hash if password was changed or is new
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Method: Compare Password ─────────────────────────────────
// Used during login to check if entered password is correct
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
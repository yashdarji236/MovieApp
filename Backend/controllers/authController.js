const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ─── Helper: Generate Token ───────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username }, // ← use "id" consistently
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// ─── @desc    Register / Signup a new user
// ─── @route   POST /api/auth/signup
// ─── @access  Public
const signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email and password",
      });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: "Username is already taken" });
    }

    const user = await User.create({ username, email, password });

    const token = generateToken(user);

    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ success: false, message: "Server error during signup", error: error.message });
  }
};

// ─── @desc    Login user
// ─── @route   POST /api/auth/login
// ─── @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: "Your account has been banned. Contact support." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server error during login", error: error.message });
  }
};

// ─── @desc    Get current logged in user profile
// ─── @route   GET /api/auth/me
// ─── @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // ← "User" not "userModel"

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        favorites: user.favorites,
        watchHistory: user.watchHistory,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GetMe Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching profile", error: error.message });
  }
};

// ─── @desc    Logout user
// ─── @route   POST /api/auth/logout
// ─── @access  Private
const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports = { signupUser, loginUser, getMe, logoutUser };
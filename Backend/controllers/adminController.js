const User = require("../models/User");
const Movie = require("../models/Movie");

// ─── @desc    Get all users
// ─── @route   GET /api/admin/users
// ─── @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const filter = {};

    // ── Search by username or email ───────────────────────────
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email:    { $regex: search, $options: "i" } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count:      users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching users",
      error: error.message,
    });
  }
};

// ─── @desc    Get single user by ID
// ─── @route   GET /api/admin/users/:id
// ─── @access  Private (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching user",
      error: error.message,
    });
  }
};

// ─── @desc    Ban a user
// ─── @route   PATCH /api/admin/users/:id/ban
// ─── @access  Private (Admin only)
const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ── Prevent admin from banning themselves ─────────────────
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot ban your own account",
      });
    }

    // ── Prevent banning another admin ─────────────────────────
    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot ban another admin",
      });
    }

    user.isBanned = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User "${user.username}" has been banned`,
    });
  } catch (error) {
    console.error("Ban User Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error banning user",
      error: error.message,
    });
  }
};

// ─── @desc    Unban a user
// ─── @route   PATCH /api/admin/users/:id/unban
// ─── @access  Private (Admin only)
const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBanned = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User "${user.username}" has been unbanned`,
    });
  } catch (error) {
    console.error("Unban User Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error unbanning user",
      error: error.message,
    });
  }
};

// ─── @desc    Delete a user
// ─── @route   DELETE /api/admin/users/:id
// ─── @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ── Prevent admin from deleting themselves ────────────────
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User "${user.username}" has been deleted`,
    });
  } catch (error) {
    console.error("Delete User Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error deleting user",
      error: error.message,
    });
  }
};

// ─── @desc    Promote user to admin
// ─── @route   PATCH /api/admin/users/:id/promote
// ─── @access  Private (Admin only)
const promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "User is already an admin",
      });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({
      success: true,
      message: `"${user.username}" has been promoted to admin`,
    });
  } catch (error) {
    console.error("Promote User Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error promoting user",
      error: error.message,
    });
  }
};

// ─── @desc    Get dashboard stats
// ─── @route   GET /api/admin/stats
// ─── @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments({ role: "user" });
    const totalAdmins   = await User.countDocuments({ role: "admin" });
    const bannedUsers   = await User.countDocuments({ isBanned: true });
    const totalMovies   = await Movie.countDocuments({ isActive: true });
    const inactiveMovies = await Movie.countDocuments({ isActive: false });

    // ── Recently joined users (last 5) ────────────────────────
    const recentUsers = await User.find({ role: "user" })
      .select("username email createdAt avatar")
      .sort({ createdAt: -1 })
      .limit(5);

    // ── Recently added movies (last 5) ────────────────────────
    const recentMovies = await Movie.find()
      .select("title poster category createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total:   totalUsers,
          admins:  totalAdmins,
          banned:  bannedUsers,
        },
        movies: {
          total:    totalMovies,
          inactive: inactiveMovies,
        },
      },
      recentUsers,
      recentMovies,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching stats",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  banUser,
  unbanUser,
  deleteUser,
  promoteToAdmin,
  getDashboardStats,
};
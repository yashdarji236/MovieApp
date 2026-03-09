const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Protect Route (Must Be Logged In) ───────────────────────
const protect = async (req, res, next) => {
  let token;

  // ── Check Authorization header first ──────────────────────
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // ── Fallback: check cookie ─────────────────────────────────
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided, authorization denied",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded.id ← matches what we set in generateToken({ id: user._id })
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found, authorization denied" });
    }

    if (req.user.isBanned) {
      return res.status(403).json({ success: false, message: "Your account has been banned. Contact support." });
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token, please login again" });
  }
};

// ─── Admin Only ───────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
};

module.exports = { protect, adminOnly };
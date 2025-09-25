const jwt = require("jsonwebtoken");

// Optional authentication middleware for browsing routes
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    
    if (!token) {
      // No token provided - allow access for browsing
      req.user = null;
      return next();
    }

    if (token.startsWith("Bearer")) {
      const TOKEN = token.slice(7, token.length).trimLeft();
      
      try {
        const decoded = jwt.verify(TOKEN, process.env.JWT_SECRET);
        req.user = decoded; // Store user info if token is valid
      } catch (error) {
        // Invalid token - still allow access for browsing
        req.user = null;
      }
    } else {
      // Invalid token format - still allow access for browsing
      req.user = null;
    }

    next();
  } catch (error) {
    console.log(error);
    // On error, still allow access for browsing
    req.user = null;
    next();
  }
};

// Middleware to require authentication for enrollment actions
const requireAuth = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ 
        error: "Authentication required for this action. Please login first.",
        requiresAuth: true 
      });
    }

    if (token.startsWith("Bearer")) {
      const TOKEN = token.slice(7, token.length).trimLeft();

      const decoded = jwt.verify(TOKEN, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } else {
      return res.status(401).json({ 
        error: "Invalid token format",
        requiresAuth: true 
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ 
      error: "Invalid token. Please login again.",
      requiresAuth: true 
    });
  }
};

module.exports = { optionalAuth, requireAuth };
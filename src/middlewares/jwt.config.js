const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const verifyToken = (token) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } else {
      return res.status(401).json({ error: "Invalid token format" });
    }
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { generateToken, verifyToken };

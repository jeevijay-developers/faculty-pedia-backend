const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const verifyToken = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // console.log(token.startsWith("Bearer"));
    if (token.startsWith("Bearer")) {
      const TOKEN = token.slice(7, token.length).trimLeft();

      const decoded = jwt.verify(TOKEN, process.env.JWT_SECRET);
      next();
    } else {
      return res.status(401).json({ error: "Invalid token format" });
    }
  } catch (error) {
    console.log(error);

    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { generateToken, verifyToken };

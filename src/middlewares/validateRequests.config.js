const { validationResult } = require("express-validator");

const validateRequests = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const MESSAGES = errors.array().map((err) => err.msg);
    return res.status(400).json({ errors: MESSAGES });
  }
  next();
};

module.exports = { validateRequests };

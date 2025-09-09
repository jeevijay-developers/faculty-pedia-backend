const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwt.config");
const { body, param } = require("express-validator");
const {
  createPPHQuery,
  getPPHQueriesByEducator,
  getPPHQueriesByStudent,
  getPPHQueryById,
} = require("../controllers/OneOnePPHController.js");

// Create a new PPH query
router.post(
  "/",
  verifyToken,
  [
    body("educator").isMongoId(),
    body("student").isMongoId(),
    body("subject").isString().notEmpty(),
    body("specialization").isIn(["IIT-JEE", "NEET", "CBSE"]),
    body("preferredDate").isISO8601(),
    body("preferredTime").isString().notEmpty(),
    body("duration").isNumeric(),
    body("message").optional().isString().isLength({ max: 1000 }),
  ],
  createPPHQuery
);

// Get all PPH queries for an educator
router.get(
  "/educator/:educatorId",
  verifyToken,
  param("educatorId").isMongoId(),
  getPPHQueriesByEducator
);

// Get all PPH queries for a student
router.get(
  "/student/:studentId",
  verifyToken,
  param("studentId").isMongoId(),
  getPPHQueriesByStudent
);

// Get a single PPH query by ID
router.get(
  "/by-id/:id",
  verifyToken,
  param("id").isMongoId(),
  getPPHQueryById
);

module.exports = router;
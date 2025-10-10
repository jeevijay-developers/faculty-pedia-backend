const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwt.config");
const { body, param } = require("express-validator");
const {
  createPPHQuery,
  getPPHQueriesByEducator,
  getPPHQueriesByStudent,
  getPPHQueryById,
  updatePPHQuery,
  deletePPHQuery,
} = require("../controllers/OneOnePPHController.js");
const {
  validateRequests,
} = require("../middlewares/validateRequests.config.js");

// Create a new PPH query
router.post(
  "/create-pph",
  verifyToken,
  [
    body("educator").isMongoId(),
    body("subject").isString().notEmpty(),
    body("specialization").isIn(["IIT-JEE", "NEET", "CBSE"]),
    body("preferredDate")
      .isISO8601()
      .withMessage("preferredDate must be a valid ISO date"),
    body("fees").isNumeric(),
    body("duration").isNumeric(),
    body("message").optional().isString().isLength({ max: 1000 }),
  ],
  validateRequests,
  createPPHQuery
);

// Get all PPH queries for an educator
router.get(
  "/educator/:educatorId",
  verifyToken,
  param("educatorId").isMongoId(),
  validateRequests,
  getPPHQueriesByEducator
);

// Get all PPH queries for a student
router.get(
  "/student/:studentId",
  verifyToken,
  param("studentId").isMongoId(),
  validateRequests,
  getPPHQueriesByStudent
);

// Get a single PPH query by ID
router.get("/by-id/:id", verifyToken, param("id").isMongoId(), getPPHQueryById);

// Add Edit and Delete routes for educators
router.put(
  "/edit/:id",
  verifyToken,
  [
    param("id").isMongoId(),
    body("subject").optional().isString().notEmpty(),
    body("specialization").optional().isIn(["IIT-JEE", "NEET", "CBSE"]),
    body("preferredDate").optional().isISO8601(),
    body("fees").optional().isNumeric(),
    body("duration").optional().isNumeric(),
    body("message").optional().isString().isLength({ max: 1000 }),
  ],
  validateRequests,
  updatePPHQuery
);

router.delete(
  "/delete/:id",
  verifyToken,
  param("id").isMongoId(),
  validateRequests,
  deletePPHQuery
);

module.exports = router;

const {
  createTestSeries,
  getAllTestSeries,
  getTestSeriesById,
  updateTestSeries,
  deleteTestSeries,
  getTestseriesBySpecialization,
  getTestseriesBySubject,
  getLiveTestSeriesBySlug,
} = require("../../controllers/LiveTest/live-test-series.controller");
const { verifyToken } = require("../../middlewares/jwt.config");
const {
  validateRequests,
} = require("../../middlewares/validateRequests.config");
const {
  stringChain,
  numberChain,
  mongoIDChainBody,
  mongoIDChainParams,
  dateFieldChain,
} = require("../../middlewares/validationChains");
const { query, body } = require("express-validator");

const router = require("express").Router();

// Create test series
router.post(
  "/by-specialization",
  verifyToken,
  [stringChain("specialization", 2, 10)],
  validateRequests,
  getTestseriesBySpecialization
);

router.get(
  "/by-subject",
  verifyToken,
  [stringChain("subject", 2, 20)],
  validateRequests,
  getTestseriesBySubject
);

router.post(
  "/create-test-series",
  verifyToken,
  [
    mongoIDChainBody("educatorId"),
    stringChain("title", 3, 200),
    stringChain("description.short", 10, 500),
    stringChain("description.long", 20, 2000),
    numberChain("price", 0),
    numberChain("noOfTests", 1),
    dateFieldChain("startDate"),
    dateFieldChain("endDate"),
    body("isCourseSpecific")
      .optional()
      .isBoolean()
      .withMessage("isCourseSpecific must be a boolean"),
    mongoIDChainBody("courseId")
      .optional()
      .custom((value, { req }) => {
        // If isCourseSpecific is true, courseId is required
        if (req.body.isCourseSpecific === true && !value) {
          throw new Error("courseId is required when isCourseSpecific is true");
        }
        return true;
      }),
  ],
  validateRequests,
  createTestSeries
);

// Get all test series with optional filtering and pagination
router.get(
  "/",
  [
    query("educatorId").optional().trim().isMongoId(),
    query("isCourseSpecific").optional().isBoolean(),
    query("courseId").optional().trim().isMongoId(),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequests,
  getAllTestSeries
);

// Get test series by ID
router.get(
  "/:id",
  [mongoIDChainParams("id")],
  validateRequests,
  getTestSeriesById
);

// Update test series
router.put(
  "/:id",
  verifyToken,
  [
    mongoIDChainParams("id"),
    stringChain("title", 3, 200).optional(),
    stringChain("description.short", 10, 500).optional(),
    stringChain("description.long", 20, 2000).optional(),
    numberChain("price", 0).optional(),
    numberChain("noOfTests", 1).optional(),
    dateFieldChain("startDate").optional(),
    dateFieldChain("endDate").optional(),
    body("isCourseSpecific")
      .optional()
      .isBoolean()
      .withMessage("isCourseSpecific must be a boolean"),
    mongoIDChainBody("courseId")
      .optional()
      .custom((value, { req }) => {
        // If isCourseSpecific is true, courseId is required
        if (req.body.isCourseSpecific === true && !value) {
          throw new Error("courseId is required when isCourseSpecific is true");
        }
        return true;
      }),
  ],
  validateRequests,
  updateTestSeries
);

// Delete test series
router.delete(
  "/:id",
  verifyToken,
  [mongoIDChainParams("id")],
  validateRequests,
  deleteTestSeries
);

router.get("/by-slug/:slug", verifyToken, getLiveTestSeriesBySlug);

module.exports = router;

const {
  createTestSeries,
  getAllTestSeries,
  getTestSeriesById,
  updateTestSeries,
  deleteTestSeries,
  getTestseriesBySpecialization,
  getTestseriesBySubject,
  getLiveTestSeriesBySlug,
  getLiveTestSeriesForStudent,
} = require("../../controllers/LiveTest/live-test-series.controller");
const { verifyToken } = require("../../middlewares/jwt.config");
const { optionalAuth, requireAuth } = require("../../middlewares/optionalAuth.config");
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
const { uploadSingleImage } = require("../../middlewares/multer.config");

const router = require("express").Router();

// BROWSING ROUTES - No authentication required
router.post(
  "/by-specialization",
  optionalAuth,
  [stringChain("specialization", 2, 10)],
  validateRequests,
  getTestseriesBySpecialization
);

router.get(
  "/by-subject",
  optionalAuth,
  [stringChain("subject", 2, 20)],
  validateRequests,
  getTestseriesBySubject
);

// Get all test series with optional filtering and pagination - for browsing
router.get(
  "/",
  optionalAuth,
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

// Get test series by ID - for browsing details
router.get(
  "/by-id/:id",
  optionalAuth,
  [mongoIDChainParams("id")],
  validateRequests,
  getTestSeriesById
);

// Get test series by slug - for browsing details
router.get("/by-slug/:slug", optionalAuth, getLiveTestSeriesBySlug);

// ENROLLMENT/AUTHENTICATED ROUTES
// Get test series for a student (verify enrollment) - requires auth
router.get(
  "/verify-and-get/:studentId/:seriesId",
  requireAuth,
  [mongoIDChainParams("studentId"), mongoIDChainParams("seriesId")],
  validateRequests,
  getLiveTestSeriesForStudent
);

// EDUCATOR/ADMIN ROUTES - Authentication required
// Create test series
router.post(
  "/create-test-series",
  requireAuth,
  uploadSingleImage,
  [
    mongoIDChainBody("educatorId"),
    stringChain("title", 3, 200),
    stringChain("description.short", 10, 500),
    stringChain("description.long", 20, 2000),
    numberChain("price", 0),
    numberChain("validity", 1),
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

// Update test series
router.put(
  "/:id",
  requireAuth,
  [
    mongoIDChainParams("id"),
    stringChain("title", 3, 200).optional(),
    stringChain("description.short", 10, 500).optional(),
    stringChain("description.long", 20, 2000).optional(),
    numberChain("price", 0).optional(),
    numberChain("validity", 1).optional(),
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
  requireAuth,
  [mongoIDChainParams("id")],
  validateRequests,
  deleteTestSeries
);

module.exports = router;

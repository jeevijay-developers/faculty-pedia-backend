const {
    createTestSeries,
    getAllTestSeries,
    getTestSeriesById,
    updateTestSeries,
    deleteTestSeries,
    getTestseriesBySpecialization
} = require("../../controllers/LiveTest/live-test-series.controller");
const { verifyToken } = require("../../middlewares/jwt.config");
const { validateRequests } = require("../../middlewares/validateRequests.config");
const {
    stringChain,
    numberChain,
    mongoIDChainBody,
    mongoIDChainParams,
    dateFieldChain
} = require("../../middlewares/validationChains");
const { query, body } = require("express-validator");

const router = require("express").Router();

// Create test series
router.post("/create-test-series", verifyToken, [
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
], validateRequests, createTestSeries);

// Get all test series with optional filtering and pagination
router.get("/", [
    query("educatorId").optional().trim().isMongoId(),
    query("isCourseSpecific").optional().isBoolean(),
    query("courseId").optional().trim().isMongoId(),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
], validateRequests, getAllTestSeries);

// Get test series by ID
router.get("/:id", [
    mongoIDChainParams("id"),
], validateRequests, getTestSeriesById);

// Update test series
router.put("/:id", verifyToken, [
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
], validateRequests, updateTestSeries);

// Delete test series
router.delete("/:id", verifyToken, [
    mongoIDChainParams("id"),
], validateRequests, deleteTestSeries);

router.get("/by-specialization/:specialization", verifyToken, [
  mongoIDChainParams("specialization")
], validateRequests, getTestseriesBySpecialization);

module.exports = router;
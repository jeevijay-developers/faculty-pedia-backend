const { 
    createTest, 
    getAllTests, 
    getTestById, 
    getTestsByEducator, 
    getTestsBySubject, 
    getTestsByMarkingType, 
    getTestsByDateRange, 
    updateTest, 
    deleteTest 
} = require("../../controllers/LiveTest/live-tests.controller")
const { verifyToken } = require("../../middlewares/jwt.config");
const { validateRequests } = require("../../middlewares/validateRequests.config");
const { 
    stringChain, 
    numberChain, 
    mongoIDChainBody, 
    mongoIDChainParams,
    dateFieldChain,
    enumChain,
    simpleArrayChain
} = require("../../middlewares/validationChains");
const { query, param } = require("express-validator");

const router = require("express").Router();

router.post("/create-test", verifyToken, [
    mongoIDChainBody("educatorId"),
    stringChain("title", 3, 200),
    stringChain("description.short", 10, 500),
    stringChain("description.long", 20, 2000),
    stringChain("subject", 2, 100),
    dateFieldChain("startDate"),
    numberChain("duration", 1), // duration in minutes, minimum 1
    numberChain("overallMarks.positive", 0).optional(),
    numberChain("overallMarks.negative", 0).optional(),
    enumChain("markingType", ["OAM", "PQM"]),
    mongoIDChainBody("testSeriesId").optional(),
    // Validate questions array - should be array of MongoDB ObjectIds
    simpleArrayChain("questions").custom((value, { req }) => {
        const questions = req.body.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("At least one question is required");
        }
        // Check if all questions are valid MongoDB ObjectIds
        const mongoose = require('mongoose');
        for (let questionId of questions) {
            if (!mongoose.Types.ObjectId.isValid(questionId)) {
                throw new Error(`Invalid question ID: ${questionId}`);
            }
        }
        return true;
    }),
], validateRequests, createTest);

// Get all tests with optional filtering and pagination
router.get("/", [
    query("subject").optional().trim().isLength({ min: 1, max: 100 }),
    query("educatorId").optional().trim().isMongoId(),
    query("markingType").optional().isIn(["OAM", "PQM"]),
    query("testSeriesId").optional().trim().isMongoId(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
], validateRequests, getAllTests);

// Get test by ID
router.get("/:id", [
    mongoIDChainParams("id"),
], validateRequests, getTestById);

// Get tests by educator ID
router.get("/educator/:educatorId", [
    mongoIDChainParams("educatorId"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
], validateRequests, getTestsByEducator);

// Get tests by subject
router.get("/subject", [
    param("subject").trim().isLength({ min: 2, max: 100 }).withMessage("Subject must be between 2 to 100 characters"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
], validateRequests, getTestsBySubject);

// Get tests by marking type
router.get("/marking-type/:markingType", [
    param("markingType").isIn(["OAM", "PQM"]).withMessage("Marking type must be either OAM or PQM"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
], validateRequests, getTestsByMarkingType);

// Get tests by date range
router.get("/date-range", [
    query("startDate").optional().isISO8601().withMessage("Start date must be in ISO8601 format"),
    query("endDate").optional().isISO8601().withMessage("End date must be in ISO8601 format"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
], validateRequests, getTestsByDateRange);

// Update test
router.put("/:id", verifyToken, [
    mongoIDChainParams("id"),
    mongoIDChainBody("educatorId").optional(),
    stringChain("title", 3, 200).optional(),
    stringChain("description.short", 10, 500).optional(),
    stringChain("description.long", 20, 2000).optional(),
    stringChain("subject", 2, 100).optional(),
    dateFieldChain("startDate").optional(),
    numberChain("duration", 1).optional(),
    numberChain("overallMarks.positive", 0).optional(),
    numberChain("overallMarks.negative", 0).optional(),
    enumChain("markingType", ["OAM", "PQM"]).optional(),
    mongoIDChainBody("testSeriesId").optional(),
    simpleArrayChain("questions").optional().custom((value, { req }) => {
        if (req.body.questions) {
            const questions = req.body.questions;
            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error("At least one question is required");
            }
            const mongoose = require('mongoose');
            for (let questionId of questions) {
                if (!mongoose.Types.ObjectId.isValid(questionId)) {
                    throw new Error(`Invalid question ID: ${questionId}`);
                }
            }
        }
        return true;
    }),
], validateRequests, updateTest);

// Delete test
router.delete("/:id", verifyToken, [
    mongoIDChainParams("id"),
    mongoIDChainBody("educatorId").optional(),
], validateRequests, deleteTest);


module.exports = router;
const { createTest } = require("../../controllers/LiveTest/live-tests.controller")
const { verifyToken } = require("../../middlewares/jwt.config");
const { validateRequests } = require("../../middlewares/validateRequests.config");
const { 
    stringChain, 
    numberChain, 
    mongoIDChainBody, 
    dateFieldChain,
    enumChain,
    simpleArrayChain
} = require("../../middlewares/validationChains");

const router = require("express").Router();

router.post("/create-test", verifyToken, [
    mongoIDChainBody("educatorId"),
    stringChain("title", 3, 200),
    stringChain("description.short", 10, 500),
    stringChain("description.long", 20, 2000),
    stringChain("subject", 2, 100),
    dateFieldChain("startDate"),
    numberChain("duration", 1), // duration in minutes, minimum 1
    numberChain("overallMarks.positive", 0),
    numberChain("overallMarks.negative", 0),
    enumChain("markingType", ["OAM", "PQM"]),
    mongoIDChainBody("testSeriesId"),
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

module.exports = router;
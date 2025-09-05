const {
  addNestTestSubmission,
  getTestResults,
} = require("../../controllers/LiveTest/resultController");
const { verifyToken } = require("../../middlewares/jwt.config");
const {
  validateRequests,
} = require("../../middlewares/validateRequests.config");
const {
  mongoIDChainBody,
  numberChain,
  enumChain,
  stringChain,
} = require("../../middlewares/validationChains");

const router = require("express").Router();

router.post(
  "/submit-test",
  verifyToken,
  [
    mongoIDChainBody("studentId"),
    mongoIDChainBody("seriesId"),
    mongoIDChainBody("testId"),
    numberChain("totalScore"),
    numberChain("totalUnattempted"),
    numberChain("totalIncorrect"),
    numberChain("totalCorrect"),
    numberChain("obtainedScore"),
    mongoIDChainBody("attemptedQuestions.*.studentId"),
    mongoIDChainBody("attemptedQuestions.*.testId"),
    mongoIDChainBody("attemptedQuestions.*.testSeriesId"),
    numberChain("attemptedQuestions.*.marks"),
    enumChain("attemptedQuestions.*.status", [
      "CORRECT",
      "INCORRECT",
      "UNATTEMPTED",
    ]),
    mongoIDChainBody("attemptedQuestions.*.questionId"),
    stringChain("attemptedQuestions.*.selectedOption.*"),
    // selectedOption is an array of strings
  ],
  validateRequests,
  addNestTestSubmission
);

router.get(
  "/test-results",
  verifyToken,
  [mongoIDChainBody("seriesId"), mongoIDChainBody("testId")],
  validateRequests,
  getTestResults
);

router.get(
  "/test-result/student",
  verifyToken,
  [
    mongoIDChainBody("studentId"),
    mongoIDChainBody("seriesId"),
    mongoIDChainBody("testId"),
  ],
  validateRequests,
  getTestResults
);

module.exports = router;

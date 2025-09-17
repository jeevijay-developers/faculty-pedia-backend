const {
  getResultById,
  getResultBySlug,
  addNestTestSubmission,
  getTestResults,
} = require("../controllers/ResultController");
const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  mongoIDChainBody,
  numberChain,
  enumChain,
  stringChain,
} = require("../middlewares/validationChains");

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
    mongoIDChainBody("attemptedQuestions.*.questionId"),
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

router.get("/:id", verifyToken, getResultById);

router.get("/by-slug/:slug", verifyToken, getResultBySlug);

module.exports = router;

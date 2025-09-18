const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const { mongoIDChainParams, mongoIdChainInReqParams } = require("../middlewares/validationChains");
const { uploadProfileImage } = require("../middlewares/multer.config");
const {
  nameChain,
  emailChain,
  mobileChain,
} = require("../middlewares/validationChains");
const {
  validateEmail,
  validateMobileNumber,
} = require("../middlewares/customValidator.config");
const {
  getStudentCourses,
  getStudentResults,
  getStudentFollowingEducators,
  getStudntProfile,
  getStudentUpcomingWebinars,
  getStudentTestSeries,
} = require("../controllers/StudentController");
const {
  updateStudentProfile,
} = require("../controllers/StudentUpdateController");

const router = require("express").Router();

router.get(
  "/profile/:id",
  verifyToken,
  [mongoIDChainParams("id")],
  validateRequests,
  getStudntProfile
);

// GET /api/students/:id/courses
router.get(
  "/:id/courses",
  verifyToken,
  [mongoIDChainParams("id")],
  validateRequests,
  getStudentCourses
);

// GET /api/students/:id/results
router.get(
  "/:id/results",
  verifyToken,
  [mongoIDChainParams("id")],
  validateRequests,
  getStudentResults
);

// GET /api/students/:id/following
router.get(
  "/:id/following",
  verifyToken,
  [mongoIDChainParams("id")],
  validateRequests,
  getStudentFollowingEducators
);

// PUT /api/students/:id - Update student profile
router.put(
  "/:id",
  verifyToken,
  uploadProfileImage, // Add multer middleware for image upload
  [
    mongoIDChainParams("id").bail(),
    nameChain().optional(),
    emailChain().optional(),
    mobileChain().optional(),
  ],
  validateRequests,
  updateStudentProfile
);

router.put(
  "/email-name-mobile/:studentId",
  verifyToken,
  uploadProfileImage, // Add multer middleware for image upload
  [
    mongoIdChainInReqParams("studentId").bail(),
    nameChain().optional(),
    emailChain().optional(),
    mobileChain().optional()
  ],
  validateRequests,
  updateStudentProfile
);

// GET /api/students/:id/upcoming-webinars
router.get(
  "/:id/upcoming-webinars",
  verifyToken,
  [mongoIDChainParams("id")],
  validateRequests,
  getStudentUpcomingWebinars
);

// GET /api/students/:id/test-series
router.get(
  "/:id/test-series",
  verifyToken,
  [mongoIDChainParams("id")],
  validateRequests,
  getStudentTestSeries
);

module.exports = router;

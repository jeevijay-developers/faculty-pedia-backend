const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const { mongoIDChainParams } = require("../middlewares/validationChains");
const {
  getStudentCourses,
  getStudentResults,
  getStudentFollowingEducators,
  getStudntProfile,
} = require("../controllers/StudentController");

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

module.exports = router;

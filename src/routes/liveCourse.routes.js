const { verifyToken } = require("../middlewares/jwt.config");
const { optionalAuth, requireAuth } = require("../middlewares/optionalAuth.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  dateFieldChain,
  numberChain,
  enumChain,
  mongoIDChainParams,
} = require("../middlewares/validationChains");
const {
  createCourse,
  getCoursesBySpecialization,
  getCoursesBySubject,
  getCourseById,
  getCourseBySlug,
  getAvailableOtoCourses,
  getAvailableOtoCoursesBySubject,
  getCourseForStudent,
  enrollStudentInCourse,
} = require("../controllers/LiveCourseController");
const { param } = require("express-validator");

const router = require("express").Router();

// EDUCATOR/ADMIN ROUTES - Authentication required
router.post(
  "/create/:id",
  requireAuth,
  [
    // Validate educator ID in params
    mongoIDChainParams("id"),

    // Validate specialization (enum)
    enumChain("specialization", ["IIT-JEE", "NEET", "CBSE"]),

    // Validate courseClass (enum)
    enumChain("courseClass", [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ]),
    stringChain("subject", 2, 20),
    // Validate title (string, required)
    stringChain("title", 3, 100),

    // Validate description fields (nested objects)
    stringChain("description.shortDesc", 10, 200),
    stringChain("description.longDesc", 20, 1000),

    // Validate courseType (enum)
    enumChain("courseType", ["OTA", "OTO"]),

    // Validate dates
    dateFieldChain("startDate"),
    dateFieldChain("endDate"),

    // Validate numbers
    numberChain("seatLimit", 1),
    numberChain("classDuration", 1),
    numberChain("fees", 0),
    numberChain("validity", 1),
  ],
  validateRequests,
  createCourse
);

// BROWSING ROUTES - No authentication required
router.post(
  "/by-specialization",
  optionalAuth,
  [stringChain("specialization", 2, 10)],
  validateRequests,
  getCoursesBySpecialization
);

router.get(
  "/by-subject",
  optionalAuth,
  [stringChain("subject", 2, 20)],
  validateRequests,
  getCoursesBySubject
);

router.post(
  "/by-subject",
  optionalAuth,
  [stringChain("subject", 2, 20)],
  validateRequests,
  getCoursesBySubject
);

// Get course by ID - for browsing course details
router.get(
  "/by-id/:id",
  optionalAuth,
  [mongoIDChainParams("id")],
  validateRequests,
  getCourseById
);

// Get course by slug - for browsing course details
router.get("/slug/:slug", optionalAuth, getCourseBySlug);

// Fetch all OTO type live courses with zero purchases - for browsing
router.get("/available-oto", optionalAuth, getAvailableOtoCourses);

router.get(
  "/available-oto-by-subject/:subject",
  optionalAuth,
  [
    param("subject")
      .trim()
      .isString()
      .isLength({ min: 2, max: 20 })
      .withMessage("Subject must be a string between 2 and 20 characters."),
  ],
  validateRequests,
  getAvailableOtoCoursesBySubject
);

// ENROLLMENT ROUTES - Authentication required
// Get course for a student: /student/:studentId/course/:courseId
router.get(
  "/student-course/:studentId/course/:courseId",
  requireAuth,
  [mongoIDChainParams("studentId"), mongoIDChainParams("courseId")],
  validateRequests,
  getCourseForStudent
);

// Enroll student into a course
router.post(
  "/enroll-student/:studentId/course/:courseId/enroll",
  requireAuth,
  [mongoIDChainParams("studentId"), mongoIDChainParams("courseId")],
  validateRequests,
  enrollStudentInCourse
);

module.exports = router;

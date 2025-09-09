const { verifyToken } = require("../middlewares/jwt.config");
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
  getAvailableOtoCourses,
} = require("../controllers/LiveCourseController");

const router = require("express").Router();

router.post(
  "/create/:id",
  verifyToken,
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
  ],
  validateRequests,
  createCourse
);

router.post(
  "/by-specialization",
  verifyToken,
  [stringChain("specialization", 2, 10)],
  validateRequests,
  getCoursesBySpecialization
);

router.get(
  "/by-subject",
  verifyToken,
  [stringChain("subject", 2, 20)],
  validateRequests,
  getCoursesBySubject
);

// Fetch all OTO type live courses with zero purchases
router.get("/available-oto", verifyToken, getAvailableOtoCourses);

module.exports = router;

const { param } = require("express-validator");
const {
  validateWebinarTitle,
} = require("../middlewares/customValidator.config");
const { verifyToken } = require("../middlewares/jwt.config");
const { optionalAuth, requireAuth } = require("../middlewares/optionalAuth.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  dateFieldChain,
  arrayFieldChain,
  numberChain,
  arrayEnumChain,
  enumChain,
  mongoIDChainBody,
  mongoIDChainParams,
} = require("../middlewares/validationChains");
const {
  createNewWebinar,
  attendWebinar,
  enrollWebinar,
  getAllUpcommingWebinars,
  getWebinarsBySpecialization,
  getWebinarsBySubject,
  getWebinarById,
  getWebinarBySlug,
} = require("../controllers/WebinarController");

const router = require("express").Router();

router.post(
  "/create-webinar/:id",
  verifyToken,
  [
    stringChain("title", 5, 100).custom(validateWebinarTitle).escape(),
    stringChain("description.short", 10, 50).escape(),
    stringChain("description.long", 20, 500).escape(),
    numberChain("fees"),
    enumChain("webinarType", ["OTO", "OTA"]),
    stringChain("time"),
    dateFieldChain("date"),
    numberChain("seatLimit"),
    numberChain("duration"),
    arrayEnumChain("assetsLinks", "name", [
      "PPT",
      "VIDEO",
      "PDF",
      "DOC",
    ]).withMessage("Invalid asset type"),
    arrayFieldChain("assetsLinks", "link").isURL(),
    param("id").isMongoId().withMessage("Invalid teacher ID"),
  ],
  validateRequests,
  createNewWebinar
);

// BROWSING ROUTES - No authentication required
router.get(
  "/latest-webinars",
  optionalAuth,
  validateRequests,
  getAllUpcommingWebinars
);

router.post(
  "/by-specialization",
  optionalAuth,
  [stringChain("specialization", 2, 10)],
  validateRequests,
  getWebinarsBySpecialization
);

router.post(
  "/by-subject",
  optionalAuth,
  [stringChain("subject", 2, 20)],
  validateRequests,
  getWebinarsBySubject
);

router.get(
  "/webinar-by-id/:id",
  optionalAuth,
  [mongoIDChainParams("id")],
  validateRequests,
  getWebinarById
);

// Get webinar by slug - for browsing details
router.get(
  "/by-slug/:slug",
  optionalAuth,
  [
    param("slug")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage(`slug must be between 2 to 100 characters`),
  ],
  validateRequests,
  getWebinarBySlug
);

// ENROLLMENT/PARTICIPATION ROUTES - Authentication required
router.post(
  "/attend-webinar/:webId",
  requireAuth,
  [mongoIDChainParams("webId"), mongoIDChainBody("studentId")],
  validateRequests,
  attendWebinar
);

router.post(
  "/enroll-webinar/:webId",
  requireAuth,
  [mongoIDChainParams("webId"), mongoIDChainBody("studentId")],
  enrollWebinar
);

module.exports = router;

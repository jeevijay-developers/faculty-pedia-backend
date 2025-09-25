const {
  updateEducatorStatus,
  getEducatorsBySpecialization,
  getEducatorsBySubject,
  getEducatorById,
  getEducatorBySlug,
  getAllEducators,
  createSampleEducators,
} = require("../controllers/EducatorController");

const { verifyToken } = require("../middlewares/jwt.config");
const { optionalAuth, requireAuth } = require("../middlewares/optionalAuth.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  enumChain,
  mongoIDChainParams,
} = require("../middlewares/validationChains");

const router = require("express").Router();

// BROWSING ROUTES - No authentication required
// Get all educators with optional filters
router.get(
  "/all",
  optionalAuth,
  getAllEducators
);

router.post(
  "/by-specialization",
  optionalAuth,
  [stringChain("specialization", 2, 10)],
  validateRequests,
  getEducatorsBySpecialization
);

router.post(
  "/by-subject",
  optionalAuth,
  [stringChain("subject", 2, 20)],
  validateRequests,
  getEducatorsBySubject
);

router.get(
  "/by-id/:id",
  optionalAuth,
  [mongoIDChainParams("id")],
  validateRequests,
  getEducatorById
);

router.get("/slug/:slug", optionalAuth, getEducatorBySlug);

// ADMIN/EDUCATOR MANAGEMENT ROUTES - Authentication required
// Create sample educators (for testing)
router.post(
  "/create-samples",
  createSampleEducators
);

// Placeholder route
router.put(
  "/educators/update-status",
  requireAuth,
  [stringChain("id"), enumChain("status", ["active", "inactive"])],
  validateRequests,
  updateEducatorStatus
);

module.exports = router;

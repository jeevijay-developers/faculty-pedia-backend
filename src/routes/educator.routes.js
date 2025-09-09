const {
  updateEducatorStatus,
  getEducatorsBySpecialization,
  getEducatorsBySubject,
} = require("../controllers/EducatorController");
const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  enumChain,
  mongoIDChainParams,
} = require("../middlewares/validationChains");

const router = require("express").Router();

// Placeholder route
router.put(
  "/educators/update-status",
  verifyToken,
  [stringChain("id"), enumChain("status", ["active", "inactive"])],
  validateRequests,
  updateEducatorStatus
);

router.post(
  "/by-specialization",
  verifyToken,
  [stringChain("specialization", 2, 10)],
  validateRequests,
  getEducatorsBySpecialization
);

router.get(
  "/by-subject",
  verifyToken,
  [stringChain("subject", 2, 20)],
  validateRequests,
  getEducatorsBySubject
);

module.exports = router;

const { updateEducatorStatus, getEducatorsBySpecialization } = require("../controllers/EducatorController");
const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const { stringChain, enumChain, mongoIDChainParams } = require("../middlewares/validationChains");

const router = require("express").Router();

// Placeholder route
router.put(
  "/educators/update-status",
  verifyToken,
  [stringChain("id"), enumChain("status", ["active", "inactive"])],
  validateRequests,
  updateEducatorStatus
);

router.get("/by-specialization/:specialization", verifyToken, [
  mongoIDChainParams("specialization")
], validateRequests, getEducatorsBySpecialization);

module.exports = router;

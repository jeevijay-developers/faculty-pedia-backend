const { updateEducatorStatus } = require("../controllers/EducatorController");
const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const { stringChain, enumChain } = require("../middlewares/validationChains");

const router = require("express").Router();

// Placeholder route
router.put(
  "/educators/update-status",
  verifyToken,
  [stringChain("id"), enumChain("status", ["active", "inactive"])],
  validateRequests,
  updateEducatorStatus
);

module.exports = router;

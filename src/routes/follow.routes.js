const { body } = require("express-validator");
const { updateFollowerCount } = require("../controllers/FollowController");
const { validateRequests } = require("../middlewares/validateRequests.config");
const { stringChain, enumChain } = require("../middlewares/validationChains");
const { verifyToken } = require("../middlewares/jwt.config");

const router = require("express").Router();

router.put(
  "/update/followers",
  verifyToken,
  [
    stringChain("educatorid"),
    stringChain("studentid"),
    enumChain("action", ["follow", "unfollow"]),
  ],
  validateRequests,
  updateFollowerCount
);

module.exports = router;

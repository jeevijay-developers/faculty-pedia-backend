const router = require("express").Router();
const {
  updateStudentsEmailNameAndMobileNumber,
} = require("../controllers/StudentUpdateController");
const {
  validateEmail,
  validateMobileNumber,
} = require("../middlewares/customValidator.config");
const { verifyToken } = require("../middlewares/jwt.config");
const {
  nameChain,
  emailChain,
  mobileChain,
  mongoIdChainInReqParams,
} = require("../middlewares/validationChains");
const { validateRequests } = require("../middlewares/validateRequests.config");

router.put(
  "/student/email-name-mobile/:studentId",
  verifyToken,
  [
    mongoIdChainInReqParams("studentId").bail(),
    nameChain().optional(),
    emailChain().optional().custom(validateEmail).bail(),
    mobileChain().optional().custom(validateMobileNumber).bail(),
  ],
  validateRequests,
  updateStudentsEmailNameAndMobileNumber
);

module.exports = router;

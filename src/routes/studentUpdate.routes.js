const router = require("express").Router();
const {
  updateStudentProfile,
} = require("../controllers/StudentUpdateController");
const {
  validateEmail,
  validateMobileNumber,
} = require("../middlewares/customValidator.config");
const { verifyToken } = require("../middlewares/jwt.config");
const { uploadProfileImage } = require("../middlewares/multer.config");
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
  uploadProfileImage, // Add multer middleware for image upload
  [
    mongoIdChainInReqParams("studentId").bail(),
    nameChain().optional(),
    emailChain().optional().custom(validateEmail).bail(),
    mobileChain().optional().custom(validateMobileNumber).bail(),
  ],
  validateRequests,
  updateStudentProfile
);

// Alternative route with /:id for compatibility
router.put(
  "/student/email-name-mobile/:id",
  verifyToken,
  uploadProfileImage, // Add multer middleware for image upload
  [
    mongoIdChainInReqParams("id").bail(),
    nameChain().optional(),
    emailChain().optional().custom(validateEmail).bail(),
    mobileChain().optional().custom(validateMobileNumber).bail(),
  ],
  validateRequests,
  updateStudentProfile
);

module.exports = router;

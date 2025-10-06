const { body } = require("express-validator");
const {
  signUpStudent,
  signUpEducator,
  loginStudent,
  loginEducator,
  getCurrentEducator,
} = require("../controllers/AuthController");
const {
  emailChain,
  mobileChain,
  nameChain,
  passwordChain,
  stringChain,
  arrayFieldChain,
  dateFieldChain,
  enumChain,
} = require("../middlewares/validationChains");
const {
  validateEmail,
  validateMobileNumber,
} = require("../middlewares/customValidator.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const { verifyToken } = require("../middlewares/jwt.config");

const router = require("express").Router();

router.post(
  "/signup-student",
  [
    emailChain().custom(validateEmail),
    mobileChain().custom(validateMobileNumber),
    nameChain(),
    passwordChain(),
  ],
  validateRequests,
  signUpStudent
);
router.post(
  "/signup-educator",
  [
    emailChain().custom(validateEmail),
    mobileChain().custom(validateMobileNumber),
    passwordChain(),
    stringChain("firstName", 2, 30),
    stringChain("lastName", 2, 30),
    stringChain("bio", 10, 1000),
    enumChain("specialization", ["IIT-JEE", "NEET", "CBSE"]),
    stringChain("subject", 2, 100),
    arrayFieldChain("workExperience", "title", 2, 50),
    arrayFieldChain("workExperience", "company", 2, 50),
    dateFieldChain("workExperience.*.startDate"),
    dateFieldChain("workExperience.*.endDate"),
    arrayFieldChain("qualification", "title", 2, 50),
    arrayFieldChain("qualification", "institute", 2, 100),
    dateFieldChain("qualification.*.startDate"),
    dateFieldChain("qualification.*.endDate"),
  ],
  validateRequests,
  signUpEducator
);

router.post(
  "/login-student",
  [emailChain(), passwordChain()],
  validateRequests,
  loginStudent
);

router.post(
  "/login-educator",
  [emailChain(), passwordChain()],
  validateRequests,
  loginEducator
);

// Get current educator profile (protected route)
router.get(
  "/educator/me",
  verifyToken,
  getCurrentEducator
);

module.exports = router;

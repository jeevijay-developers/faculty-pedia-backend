const { body } = require("express-validator");
const {
  signUpStudent,
  signUpEducator,
} = require("../controllers/AuthController");
const {
  emailChain,
  mobileChain,
  nameChain,
  passwordChain,
  stringChain,
  arrayFieldChain,
  dateFieldChain,
} = require("../middlewares/validationChains");
const {
  validateEmail,
  validateMobileNumber,
} = require("../middlewares/customValidator.config");
const { validateRequests } = require("../middlewares/validateRequests.config");

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
    stringChain("bio", 15, 100),
    body("specialization")
      .isIn(["IIT-JEE", "NEET", "CBSE"])
      .withMessage("Specialization must be one of: IIT-JEE, NEET, CBSE"),

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

module.exports = router;

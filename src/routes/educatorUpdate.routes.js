const {
  updateNameEmailMobileNumberAndBio,
  updateQualification,
  updateSocialLinks,
  updateWorkExperience,
  updateEducatorImage,
  updateSpecializationAndExperience,
} = require("../controllers/UpdateEducatorController");
const {
  validateEmail,
  validateMobileNumber,
} = require("../middlewares/customValidator.config");
const { verifyToken } = require("../middlewares/jwt.config");
const { uploadProfileImage } = require("../middlewares/multer.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const { body } = require("express-validator");
const {
  stringChain,
  emailChain,
  numberChain,
  arrayFieldChain,
  dateFieldChain,
  mongoIdChainInReqParams,
  arrayOrStringEnumChain,
  arrayOrStringChain,
} = require("../middlewares/validationChains");

const router = require("express").Router();

router.put(
  "/update-name-email-number-bio-ivlink/:educatorId",
  verifyToken,
  [
    mongoIdChainInReqParams("educatorId"),
    stringChain("firstName", 5, 30).optional(),
    stringChain("lastName", 5, 30).optional(),
    emailChain("email").optional(),
    numberChain("mobileNumber").optional(),
    stringChain("bio", 10, 500).optional(),
    stringChain("description", 20, 1000).optional(),
    body("introVideoLink")
      .optional({ checkFalsy: true })
      .trim()
      .isURL()
      .withMessage("introVideoLink must be a valid URL"),
  ],
  validateRequests,
  updateNameEmailMobileNumberAndBio
);

// Route for updating educator profile image
router.put(
  "/update-image/:educatorId",
  verifyToken,
  uploadProfileImage, // Add multer middleware for image upload
  [mongoIdChainInReqParams("educatorId")],
  validateRequests,
  updateEducatorImage
);

router.put(
  "/update-work-experience/:educatorId",
  verifyToken,
  [
    mongoIdChainInReqParams("educatorId"),
    arrayFieldChain("workExperience", "title", 2, 100),
    arrayFieldChain("workExperience", "company", 2, 100),
    dateFieldChain("workExperience.*.startDate"),
    dateFieldChain("workExperience.*.endDate"),
  ],
  validateRequests,
  updateWorkExperience
);
router.put(
  "/update-qualifications/:educatorId",
  verifyToken,
  [
    mongoIdChainInReqParams("educatorId"),
    arrayFieldChain("qualification", "title", 2, 100),
    arrayFieldChain("qualification", "institute", 2, 100),
    dateFieldChain("qualification.*.startDate"),
    dateFieldChain("qualification.*.endDate"),
  ],
  validateRequests,
  updateQualification
);

router.put(
  "/update-social-links/:educatorId",
  verifyToken,
  [
    mongoIdChainInReqParams("educatorId"),
    stringChain("socials.linkedin", 5, 200).isURL().optional(),
    stringChain("socials.twitter", 5, 200).isURL().optional(),
    stringChain("socials.facebook", 5, 200).isURL().optional(),
    stringChain("socials.instagram", 5, 200).isURL().optional(),
    stringChain("socials.youtube", 5, 200).isURL().optional(),
  ],
  validateRequests,
  updateSocialLinks
);

router.put(
  "/update-specialization-experience/:educatorId",
  verifyToken,
  [
    mongoIdChainInReqParams("educatorId"),
    arrayOrStringEnumChain("specialization", [
      "Physics",
      "Chemistry",
      "Biology",
      "Mathematics",
      "IIT-JEE",
      "NEET",
      "CBSE",
    ]),
    arrayOrStringChain("subject", 2),
    numberChain("yearsExperience", 0).optional(),
  ],
  validateRequests,
  updateSpecializationAndExperience
);

module.exports = router;

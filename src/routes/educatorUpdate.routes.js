const {
  updateNameEmailMobileNumberAndBio,
  updateQualification,
  updateSocialLinks,
} = require("../controllers/UpdateEducatorController");
const {
  validateEmail,
  validateMobileNumber,
} = require("../middlewares/customValidator.config");
const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  emailChain,
  numberChain,
  arrayFieldChain,
  dateFieldChain,
  mongoIdChainInReqParams,
} = require("../middlewares/validationChains");

const router = require("express").Router();

router.put(
  "/educator/update-name-email-number-bio-ivlink/:educatorId",
  verifyToken,
  [
    mongoIdChainInReqParams("educatorId"),
    stringChain("firstName", 5, 30).optional(),
    stringChain("lastName", 5, 30).optional(),
    emailChain("email").optional().custom(validateEmail),
    numberChain("mobileNumber").optional().custom(validateMobileNumber),
    stringChain("bio", 10, 500).optional(),
    stringChain("introVideoLink", 5, 500).isURL().optional(),
  ],
  validateRequests,
  updateNameEmailMobileNumberAndBio
);

router.put(
  "/educator/update-work-experience/:educatorId",
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
  "/educator/update-qualifications/:educatorId",
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
  "/educator/update-social-links/:educatorId",
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
  "/educator/update-specialization-experience/:educatorId",
  verifyToken,
  [
    mongoIdChainInReqParams("educatorId"),
    enumChain("specialization", [
      "Physics",
      "Chemistry",
      "Biology",
      "Mathematics",
      "IIT-JEE",
      "NEET",
      "CBSE",
    ]),
    numberChain("yearsExperience", 0),
  ],
  validateRequests,
  async (req, res) => {
    res
      .status(200)
      .json({ message: "Educator qualification updated successfully" });
  }
);

module.exports = router;

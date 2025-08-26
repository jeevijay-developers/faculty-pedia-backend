const { param } = require("express-validator");
const {
  validateWebinarTitle,
} = require("../middlewares/customValidator.config");
const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  dateFieldChain,
  arrayFieldChain,
  numberChain,
  arrayEnumChain,
  enumChain,
} = require("../middlewares/validationChains");
const { createNewWebinar } = require("../controllers/WebinarController");

const router = require("express").Router();

router.post(
  "/create-webinar",
  verifyToken,
  [
    stringChain("title", 5, 100).custom(validateWebinarTitle).escape(),
    stringChain("description.short", 10, 50).escape(),
    stringChain("description.long", 20, 500).escape(),
    numberChain("fees"),
    enumChain("webinarType", ["OTO", "OTA"]),
    stringChain("time"),
    dateFieldChain("date"),
    numberChain("seatLimit"),
    numberChain("duration"),
    arrayEnumChain("assetsLinks", "name", [
      "PPT",
      "VIDEO",
      "PDF",
      "DOC",
    ]).withMessage("Invalid asset type"),
    arrayFieldChain("assetsLinks", "link").isURL(),
    param("id").isMongoId().withMessage("Invalid teacher ID"),
  ],
  validateRequests,
  createNewWebinar
);

module.exports = router;

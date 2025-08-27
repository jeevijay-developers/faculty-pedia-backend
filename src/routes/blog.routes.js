const { createNewBlog, getAllBlogs } = require("../controllers/BlogController");
const { validateBlogTitle } = require("../middlewares/customValidator.config");
const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  mongoIDChain,
  arrayEnumChain,
  enumChain,
  arrayFieldChain,
  simpleArrayChain,
} = require("../middlewares/validationChains");

const router = require("express").Router();

router.post(
  "/create-blog",
  verifyToken,
  [
    // Add validation chains here
    stringChain("title").custom(validateBlogTitle),
    stringChain("content.short", 10, 300),
    stringChain("content.long", 20, 5000),
    mongoIDChain("author"),
    simpleArrayChain("tags"), // No specific allowed values for tags
    enumChain("category", [
      "NEET",
      "JEE",
      "UPSC",
      "SSC",
      "BANKING",
      "RAILWAYS",
      "OTHER",
      "CBSE",
      "ICSE",
      "STATE_BOARD",
    ]),
  ],
  validateRequests,
  createNewBlog
);

router.get("/get-all-blogs", verifyToken, getAllBlogs);

module.exports = router;

const {
  createNewBlog,
  getAllBlogs,
  getLatestBlogs,
} = require("../controllers/BlogController");
const { getWebinarsBySpecialization, getWebinarsBySubject } = require("../controllers/WebinarController");
const { validateBlogTitle } = require("../middlewares/customValidator.config");
const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  enumChain,
  simpleArrayChain,
  mongoIDChainBody,
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
    mongoIDChainBody("author"),
    simpleArrayChain("tags"), // No specific allowed values for tags
    enumChain("specialization", ["IIT-JEE", "NEET", "CBSE"]),
    stringChain("subject", 2, 30),
  ],
  validateRequests,
  createNewBlog
);

router.get("/get-all-blogs", verifyToken, getAllBlogs);
router.get("/get-latest-blogs", verifyToken, getLatestBlogs);
router.get("/by-specialization", verifyToken, [
  stringChain("specialization", 2, 10)
], validateRequests, getWebinarsBySpecialization);

router.get("/by-subject", verifyToken, [
  stringChain("subject", 2, 20)
], validateRequests, getWebinarsBySubject);

module.exports = router;

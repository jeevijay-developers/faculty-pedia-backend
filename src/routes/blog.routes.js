const {
  createNewBlog,
  getAllBlogs,
  getLatestBlogs,
  getBlogsBySpecialization,
  getBlogsBySubject,
  getBlogById,
  getBlogBySlug,
} = require("../controllers/BlogController");
const { validateBlogTitle } = require("../middlewares/customValidator.config");
const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  enumChain,
  simpleArrayChain,
  mongoIDChainBody,
  mongoIDChainParams,
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
router.post(
  "/by-specialization",
  verifyToken,
  [stringChain("specialization", 2, 10)],
  validateRequests,
  getBlogsBySpecialization
);

router.get(
  "/by-subject",
  verifyToken,
  [stringChain("subject", 2, 20)],
  validateRequests,
  getBlogsBySubject
);

router.get("/:id", verifyToken, [
  mongoIDChainParams("id")
], validateRequests, getBlogById);

router.get("/slug/:slug", verifyToken, getBlogBySlug);

module.exports = router;

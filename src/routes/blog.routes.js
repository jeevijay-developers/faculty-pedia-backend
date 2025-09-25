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
const { optionalAuth, requireAuth } = require("../middlewares/optionalAuth.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  enumChain,
  simpleArrayChain,
  mongoIDChainBody,
  mongoIDChainParams,
} = require("../middlewares/validationChains");

const router = require("express").Router();

// BROWSING ROUTES - No authentication required
router.get("/get-all-blogs", optionalAuth, getAllBlogs);
router.get("/get-latest-blogs", optionalAuth, getLatestBlogs);
router.post(
  "/by-specialization",
  optionalAuth,
  [stringChain("specialization", 2, 10)],
  validateRequests,
  getBlogsBySpecialization
);

router.get(
  "/by-subject",
  optionalAuth,
  [stringChain("subject", 2, 20)],
  validateRequests,
  getBlogsBySubject
);

router.get("/:id", optionalAuth, [
  mongoIDChainParams("id")
], validateRequests, getBlogById);

router.get("/slug/:slug", optionalAuth, getBlogBySlug);

// ADMIN/CREATION ROUTES - Authentication required
router.post(
  "/create-blog",
  requireAuth,
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

module.exports = router;

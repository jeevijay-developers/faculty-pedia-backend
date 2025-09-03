const { 
  createQuestion, 
  getAllQuestions, 
  getQuestionById, 
  getQuestionsByEducator, 
  updateQuestion, 
  deleteQuestion 
} = require("../../controllers/LiveTest/questions.controller");
const { verifyToken } = require("../../middlewares/jwt.config");
const { validateRequests } = require("../../middlewares/validateRequests.config");
const { stringChain, numberChain, mongoIDChainParams } = require("../../middlewares/validationChains");
const { query } = require("express-validator");
const multer = require("multer");

const router = require("express").Router();

// Configure multer for multiple file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Define the fields for file uploads
const uploadFields = upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'optionAImage', maxCount: 1 },
  { name: 'optionBImage', maxCount: 1 },
  { name: 'optionCImage', maxCount: 1 },
  { name: 'optionDImage', maxCount: 1 }
]);

router.post("/create-question", verifyToken, uploadFields, [
    stringChain("title", 5, 1000),
    stringChain("subject", 5, 100),
    stringChain("topic", 5, 200),
    numberChain("marks.positive"),
    numberChain("marks.negative"),
    stringChain("options.A.text").custom((value) => {
        if (!value) {
            throw new Error("Option A text is required");
        }
        return true;
    }),
    stringChain("options.B.text").custom((value) => {
        if (!value) {
            throw new Error("Option B text is required");
        }
        return true;
    }),
    stringChain("options.C.text").custom((value) => {
        if (!value) {
            throw new Error("Option C text is required");
        }
        return true;
    }),
    stringChain("options.D.text").custom((value) => {
        if (!value) {
            throw new Error("Option D text is required");
        }
        return true;
    }),
    // Validate correctOptions array
    stringChain("correctOptions").custom((value) => {
        try {
            const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
            if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
                throw new Error("At least one correct option must be selected");
            }
            const validOptions = ['A', 'B', 'C', 'D'];
            const invalidOptions = parsedValue.filter(option => !validOptions.includes(option));
            if (invalidOptions.length > 0) {
                throw new Error(`Invalid correct options: ${invalidOptions.join(', ')}`);
            }
            return true;
        } catch (error) {
            throw new Error("Correct options must be a valid array of option letters (A, B, C, D)");
        }
    }),
], validateRequests, createQuestion);

// Get all questions with optional filtering and pagination
router.get("/", [
    // Optional query parameters for filtering
    query("subject").optional().trim().isLength({ min: 1, max: 100 }),
    query("topic").optional().trim().isLength({ min: 1, max: 200 }),
    query("educatorId").optional().trim().isMongoId(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
], validateRequests, getAllQuestions);

// Get question by ID
router.get("/:id", [
    mongoIDChainParams("id"),
], validateRequests, getQuestionById);

// Get questions by educator ID
router.get("/educator/:educatorId", [
    mongoIDChainParams("educatorId"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
], validateRequests, getQuestionsByEducator);

// Update question
router.put("/:id", verifyToken, uploadFields, [
    mongoIDChainParams("id"),
    stringChain("title", 5, 1000).optional(),
    stringChain("subject", 5, 100).optional(),
    stringChain("topic", 5, 200).optional(),
    numberChain("marks.positive").optional(),
    numberChain("marks.negative").optional(),
    stringChain("options.A.text").optional(),
    stringChain("options.B.text").optional(),
    stringChain("options.C.text").optional(),
    stringChain("options.D.text").optional(),
    // Validate correctOptions array if provided
    stringChain("correctOptions").optional().custom((value) => {
        if (value) {
            try {
                const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
                if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
                    throw new Error("At least one correct option must be selected");
                }
                const validOptions = ['A', 'B', 'C', 'D'];
                const invalidOptions = parsedValue.filter(option => !validOptions.includes(option));
                if (invalidOptions.length > 0) {
                    throw new Error(`Invalid correct options: ${invalidOptions.join(', ')}`);
                }
            } catch (error) {
                throw new Error("Correct options must be a valid array of option letters (A, B, C, D)");
            }
        }
        return true;
    }),
], validateRequests, updateQuestion);

// Delete question
router.delete("/:id", verifyToken, [
    mongoIDChainParams("id"),
], validateRequests, deleteQuestion);


module.exports = router;
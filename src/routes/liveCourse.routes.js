const { verifyToken } = require("../middlewares/jwt.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  stringChain,
  dateFieldChain,
  numberChain,
  enumChain,
  mongoIDChainParams,
} = require("../middlewares/validationChains");
const { createCourse } = require("../controllers/LiveCourseController");


const router = require("express").Router();

router.post("/create/:id", verifyToken, [
  // Validate educator ID in params
  mongoIDChainParams("id"),
  
  // Validate specialization (enum)
  enumChain("specialization", ["IIT-JEE", "NEET", "CBSE"]),
  
  // Validate courseClass (enum)
  enumChain("courseClass", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]),
  
  // Validate title (string, required)
  stringChain("title", 3, 100),
  
  // Validate description fields (nested objects)
  stringChain("description.shortDesc", 10, 200),
  stringChain("description.longDesc", 20, 1000),
  
  // Validate courseType (enum)
  enumChain("courseType", ["OTA", "OTO"]),
  
  // Validate dates
  dateFieldChain("startDate"),
  dateFieldChain("endDate"),
  
  // Validate numbers
  numberChain("seatLimit", 1),
  numberChain("classDuration", 1),
  numberChain("fees", 0),

], validateRequests, createCourse);

module.exports = router;

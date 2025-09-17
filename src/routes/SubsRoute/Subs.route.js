const express = require("express");
const router = express.Router();
const { 
  subscribeToCourse, 
  subscribeToTestSeries, 
  subscribeToLiveClass, 
  subscribeToWebinar 
} = require("../../controllers/SubscriptionControllers/Subs.controller");
const { mongoIDChainBody } = require("../../middlewares/validationChains");
const { validateRequests } = require("../../middlewares/validateRequests.config");

// POST /api/subscribe-course
router.post(
  "/subscribe-course",
  [mongoIDChainBody("studentId"), mongoIDChainBody("courseId")],
  validateRequests,
  subscribeToCourse
);

// POST /api/subscribe-testseries
router.post(
  "/subscribe-testseries",
  [mongoIDChainBody("studentId"), mongoIDChainBody("testSeriesId")],
  validateRequests,
  subscribeToTestSeries
);

// POST /api/subscribe-liveclass
router.post(
  "/subscribe-liveclass",
  [mongoIDChainBody("studentId"), mongoIDChainBody("liveClassId")],
  validateRequests,
  subscribeToLiveClass
);

// POST /api/subscribe-webinar
router.post(
  "/subscribe-webinar",
  [mongoIDChainBody("studentId"), mongoIDChainBody("webinarId")],
  validateRequests,
  subscribeToWebinar
);

module.exports = router;

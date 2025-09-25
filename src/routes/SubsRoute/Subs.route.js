const express = require("express");
const router = express.Router();
const { 
  subscribeToCourse, 
  subscribeToTestSeries, 
  subscribeToLiveClass, 
  subscribeToWebinar 
} = require("../../controllers/SubscriptionControllers/Subs.controller");
const { requireAuth } = require("../../middlewares/optionalAuth.config");
const { mongoIDChainBody } = require("../../middlewares/validationChains");
const { validateRequests } = require("../../middlewares/validateRequests.config");

// All subscription routes require authentication
// POST /api/subscribe-course
router.post(
  "/subscribe-course",
  requireAuth,
  [mongoIDChainBody("studentId"), mongoIDChainBody("courseId")],
  validateRequests,
  subscribeToCourse
);

// POST /api/subscribe-testseries
router.post(
  "/subscribe-testseries",
  requireAuth,
  [mongoIDChainBody("studentId"), mongoIDChainBody("testSeriesId")],
  validateRequests,
  subscribeToTestSeries
);

// POST /api/subscribe-liveclass
router.post(
  "/subscribe-liveclass",
  requireAuth,
  [mongoIDChainBody("studentId"), mongoIDChainBody("liveClassId")],
  validateRequests,
  subscribeToLiveClass
);

// POST /api/subscribe-webinar
router.post(
  "/subscribe-webinar",
  requireAuth,
  [mongoIDChainBody("studentId"), mongoIDChainBody("webinarId")],
  validateRequests,
  subscribeToWebinar
);

module.exports = router;

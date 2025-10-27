const express = require("express");
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getStudentPayments,
  getEducatorPayments,
  settlePayment,
} = require("../controllers/PaymentController");
const { requireAuth } = require("../middlewares/optionalAuth.config");
const { validateRequests } = require("../middlewares/validateRequests.config");
const {
  mongoIDChainBody,
  mongoIDChainParams,
  stringChain,
} = require("../middlewares/validationChains");

// POST /api/payment/create-order
// Create a Razorpay order for payment
router.post(
  "/create-order",
  requireAuth,
  [
    mongoIDChainBody("studentId"),
    stringChain("resourceType", 4, 15),
    mongoIDChainBody("resourceId"),
  ],
  validateRequests,
  createPaymentOrder
);

// POST /api/payment/verify
// Verify payment after student completes payment
router.post(
  "/verify",
  requireAuth,
  [
    stringChain("razorpayOrderId", 10, 50),
    stringChain("razorpayPaymentId", 10, 50),
    stringChain("razorpaySignature", 10, 200),
  ],
  validateRequests,
  verifyPayment
);

// POST /api/payment/webhook
// Razorpay webhook endpoint (no auth required, signature verified in controller)
router.post("/webhook", handleWebhook);

// GET /api/payment/student/:studentId
// Get all payments for a student
router.get(
  "/student/:studentId",
  requireAuth,
  [mongoIDChainParams("studentId")],
  validateRequests,
  getStudentPayments
);

// GET /api/payment/educator/:educatorId
// Get all payments for an educator
router.get(
  "/educator/:educatorId",
  requireAuth,
  [mongoIDChainParams("educatorId")],
  validateRequests,
  getEducatorPayments
);

// POST /api/payment/settle/:paymentId
// Settle a payment (admin/cron job)
router.post(
  "/settle/:paymentId",
  requireAuth,
  [mongoIDChainParams("paymentId")],
  validateRequests,
  settlePayment
);

module.exports = router;

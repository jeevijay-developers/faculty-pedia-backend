const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // Razorpay Details
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },

    // Student & Educator
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    educatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Educator",
      required: true,
    },

    // Payment Details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },

    // Revenue Split (5% platform commission)
    platformCommission: {
      type: Number,
      required: true,
    },
    educatorRevenue: {
      type: Number,
      required: true,
    },

    // Payment Status
    status: {
      type: String,
      enum: ["created", "pending", "success", "failed", "refunded"],
      default: "created",
    },

    // Resource Details - What was purchased
    resourceType: {
      type: String,
      enum: ["course", "testSeries", "liveClass", "webinar"],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "resourceModel",
    },
    resourceModel: {
      type: String,
      required: true,
      enum: ["LiveCourse", "LiveTestSeries", "LiveClass", "Webinar"],
    },

    // Settlement Details
    isSettled: {
      type: Boolean,
      default: false,
    },
    settledAt: {
      type: Date,
      default: null,
    },

    // Additional metadata
    failureReason: {
      type: String,
      default: null,
    },
    refundReason: {
      type: String,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },

    // Webhook data
    webhookData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
paymentSchema.index({ studentId: 1, createdAt: -1 });
paymentSchema.index({ educatorId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ isSettled: 1 });

module.exports = mongoose.model("Payment", paymentSchema);

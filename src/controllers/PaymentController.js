const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const Educator = require("../models/Educator");
const LiveCourse = require("../models/LiveCourse");
const LiveTestSeries = require("../models/LiveTestSeries");
const LiveClass = require("../models/LiveClass");
const Webinar = require("../models/Webinar");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function to get resource model and pricing
const getResourceDetails = async (resourceType, resourceId) => {
  let resource;
  let model;
  let priceField;

  switch (resourceType) {
    case "course":
      resource = await LiveCourse.findById(resourceId).populate("educatorId");
      model = "LiveCourse";
      priceField = "fees";
      break;
    case "testSeries":
      resource = await LiveTestSeries.findById(resourceId).populate(
        "educatorId"
      );
      model = "LiveTestSeries";
      priceField = "price";
      break;
    case "liveClass":
      resource = await LiveClass.findById(resourceId).populate({
        path: "courseId",
        populate: { path: "educatorId" },
      });
      model = "LiveClass";
      // Live classes are part of courses, so no separate price
      if (resource && resource.courseId) {
        return {
          resource,
          model,
          price: resource.courseId.fees,
          educatorId: resource.courseId.educatorId._id,
        };
      }
      return null;
    case "webinar":
      resource = await Webinar.findById(resourceId).populate("educatorId");
      model = "Webinar";
      priceField = "fees";
      break;
    default:
      return null;
  }

  if (!resource) return null;

  return {
    resource,
    model,
    price: resource[priceField],
    educatorId: resource.educatorId._id,
  };
};

// POST /api/payment/create-order
// Body: { studentId, resourceType, resourceId }
exports.createPaymentOrder = async (req, res) => {
  try {
    const { studentId, resourceType, resourceId } = req.body;

    // Validate input
    if (!studentId || !resourceType || !resourceId) {
      return res.status(400).json({
        success: false,
        message: "studentId, resourceType, and resourceId are required.",
      });
    }

    // Validate resource type
    if (
      !["course", "testSeries", "liveClass", "webinar"].includes(resourceType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource type.",
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Get resource details
    const resourceDetails = await getResourceDetails(resourceType, resourceId);
    if (!resourceDetails) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    const { price, educatorId, model } = resourceDetails;

    // Check if price is valid
    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price for this resource.",
      });
    }

    // Calculate platform commission (5%) and educator revenue (95%)
    const platformCommission = Math.round(price * 0.05);
    const educatorRevenue = price - platformCommission;

    // Create Razorpay order
    const options = {
      amount: price * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        studentId: studentId.toString(),
        resourceType,
        resourceId: resourceId.toString(),
        educatorId: educatorId.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create payment record in database
    const payment = new Payment({
      razorpayOrderId: razorpayOrder.id,
      studentId,
      educatorId,
      amount: price,
      platformCommission,
      educatorRevenue,
      status: "created",
      resourceType,
      resourceId,
      resourceModel: model,
    });

    await payment.save();

    // Return order details to frontend
    return res.status(201).json({
      success: true,
      message: "Payment order created successfully.",
      data: {
        orderId: razorpayOrder.id,
        amount: price,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        studentMobile: student.mobileNumber,
      },
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order.",
      error: error.message,
    });
  }
};

// POST /api/payment/verify
// Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details.",
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      // Invalid signature
      payment.status = "failed";
      payment.failureReason = "Invalid signature";
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // Signature verified successfully
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "success";
    await payment.save();

    // Update educator's revenue (add to pending amount)
    const educator = await Educator.findById(payment.educatorId);
    if (educator) {
      educator.revenue.totalIncome += payment.educatorRevenue;
      educator.revenue.totalPendingAmount += payment.educatorRevenue;

      // Update last month income (simplified - you may want to add more sophisticated logic)
      const currentMonth = new Date().getMonth();
      const paymentMonth = new Date(payment.createdAt).getMonth();
      if (currentMonth === paymentMonth) {
        educator.revenue.lastMonthIncome += payment.educatorRevenue;
      }

      await educator.save();
    }

    // Complete subscription based on resource type
    await completeSubscription(payment);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      data: {
        paymentId: payment._id,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed.",
      error: error.message,
    });
  }
};

// Helper function to complete subscription after successful payment
const completeSubscription = async (payment) => {
  const { studentId, resourceType, resourceId } = payment;

  const student = await Student.findById(studentId);
  if (!student) return;

  switch (resourceType) {
    case "course":
      const course = await LiveCourse.findById(resourceId);
      if (course) {
        // Add student to course
        if (!student.courses.includes(resourceId)) {
          student.courses.push(resourceId);
        }

        // Add student to course enrolledStudents and purchases
        if (
          !course.enrolledStudents.some(
            (e) => e.studentId.toString() === studentId.toString()
          )
        ) {
          course.enrolledStudents.push({ studentId });
        }
        if (
          !course.purchases.some(
            (p) => p.studentId.toString() === studentId.toString()
          )
        ) {
          course.purchases.push({ studentId });
        }

        await course.save();
      }
      break;

    case "testSeries":
      const testSeries = await LiveTestSeries.findById(resourceId);
      if (testSeries) {
        // Add student to test series
        if (
          !student.tests.some(
            (t) => t.testSeriesId.toString() === resourceId.toString()
          )
        ) {
          student.tests.push({ testSeriesId: resourceId });
        }

        // Add student to test series enrolledStudents
        if (
          !testSeries.enrolledStudents.some(
            (e) => e.studentId.toString() === studentId.toString()
          )
        ) {
          testSeries.enrolledStudents.push({ studentId });
        }

        await testSeries.save();
      }
      break;

    case "liveClass":
      const liveClass = await LiveClass.findById(resourceId);
      if (liveClass) {
        // Add student to live class
        if (!student.liveClasses) student.liveClasses = [];
        if (!student.liveClasses.includes(resourceId)) {
          student.liveClasses.push(resourceId);
        }

        // Add student to live class enrolledStudents
        if (!liveClass.enrolledStudents) liveClass.enrolledStudents = [];
        if (
          !liveClass.enrolledStudents.some(
            (e) => e.studentId.toString() === studentId.toString()
          )
        ) {
          liveClass.enrolledStudents.push({ studentId });
        }

        await liveClass.save();
      }
      break;

    case "webinar":
      const webinar = await Webinar.findById(resourceId);
      if (webinar) {
        // Add student to webinar
        if (!student.webinars) student.webinars = [];
        if (!student.webinars.includes(resourceId)) {
          student.webinars.push(resourceId);
        }

        // Add student to webinar enrolledStudents
        if (
          !webinar.enrolledStudents.some(
            (e) => e.studentId.toString() === studentId.toString()
          )
        ) {
          webinar.enrolledStudents.push({ studentId });
        }

        await webinar.save();
      }
      break;
  }

  await student.save();
};

// POST /api/payment/webhook
// Razorpay webhook handler
exports.handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature.",
      });
    }

    const event = req.body.event;
    const payloadData = req.body.payload.payment.entity;

    // Find payment by order_id
    const payment = await Payment.findOne({
      razorpayOrderId: payloadData.order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    // Store webhook data
    payment.webhookData = req.body;

    // Handle different webhook events
    switch (event) {
      case "payment.authorized":
        payment.status = "pending";
        payment.razorpayPaymentId = payloadData.id;
        break;

      case "payment.captured":
        payment.status = "success";
        payment.razorpayPaymentId = payloadData.id;

        // Update educator revenue
        const educator = await Educator.findById(payment.educatorId);
        if (educator) {
          educator.revenue.totalIncome += payment.educatorRevenue;
          educator.revenue.totalPendingAmount += payment.educatorRevenue;
          await educator.save();
        }

        // Complete subscription
        await completeSubscription(payment);
        break;

      case "payment.failed":
        payment.status = "failed";
        payment.failureReason =
          payloadData.error_description || "Payment failed";
        break;

      case "refund.created":
        payment.status = "refunded";
        payment.refundedAt = new Date();

        // Deduct from educator's pending amount
        const educatorForRefund = await Educator.findById(payment.educatorId);
        if (educatorForRefund && !payment.isSettled) {
          educatorForRefund.revenue.totalPendingAmount = Math.max(
            0,
            educatorForRefund.revenue.totalPendingAmount -
              payment.educatorRevenue
          );
          await educatorForRefund.save();
        }
        break;
    }

    await payment.save();

    return res
      .status(200)
      .json({ success: true, message: "Webhook processed." });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed.",
      error: error.message,
    });
  }
};

// GET /api/payment/student/:studentId
// Get all payments for a student
exports.getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { studentId };
    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate("educatorId", "firstName lastName image")
      .populate("resourceId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: {
        payments,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching student payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments.",
      error: error.message,
    });
  }
};

// GET /api/payment/educator/:educatorId
// Get all payments for an educator
exports.getEducatorPayments = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const { page = 1, limit = 10, status, isSettled } = req.query;

    const filter = { educatorId, status: "success" };
    if (status) {
      filter.status = status;
    }
    if (isSettled !== undefined) {
      filter.isSettled = isSettled === "true";
    }

    const payments = await Payment.find(filter)
      .populate("studentId", "firstName lastName email")
      .populate("resourceId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    // Calculate revenue summary
    const revenueSummary = await Payment.aggregate([
      {
        $match: {
          educatorId: require("mongoose").Types.ObjectId(educatorId),
          status: "success",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$educatorRevenue" },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$isSettled", false] }, "$educatorRevenue", 0],
            },
          },
          settledAmount: {
            $sum: {
              $cond: [{ $eq: ["$isSettled", true] }, "$educatorRevenue", 0],
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        payments,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        revenueSummary: revenueSummary[0] || {
          totalRevenue: 0,
          pendingAmount: 0,
          settledAmount: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching educator payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments.",
      error: error.message,
    });
  }
};

// POST /api/payment/settle/:paymentId
// Settle a payment (admin/automated function)
exports.settlePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    if (payment.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Only successful payments can be settled.",
      });
    }

    if (payment.isSettled) {
      return res.status(400).json({
        success: false,
        message: "Payment already settled.",
      });
    }

    // Update payment settlement status
    payment.isSettled = true;
    payment.settledAt = new Date();
    await payment.save();

    // Update educator revenue
    const educator = await Educator.findById(payment.educatorId);
    if (educator) {
      educator.revenue.totalAmountSettled += payment.educatorRevenue;
      educator.revenue.totalPendingAmount = Math.max(
        0,
        educator.revenue.totalPendingAmount - payment.educatorRevenue
      );
      await educator.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment settled successfully.",
      data: payment,
    });
  } catch (error) {
    console.error("Error settling payment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to settle payment.",
      error: error.message,
    });
  }
};

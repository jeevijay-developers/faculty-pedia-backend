const Student = require("../../models/Student");
const LiveCourse = require("../../models/LiveCourse");
const TestSeries = require("../../models/LiveTestSeries");
const LiveClass = require("../../models/LiveClass");
const Webinar = require("../../models/Webinar");
const Payment = require("../../models/Payment");

// POST /api/subscribe-course
// Body: { studentId, courseId }
// NOTE: This endpoint now requires payment. Use /api/payment/create-order first,
// then complete payment, then verify via /api/payment/verify
// This endpoint is kept for backward compatibility or free courses
exports.subscribeToCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "studentId and courseId are required.",
        });
    }

    // Find student and course
    const student = await Student.findById(studentId);
    const course = await LiveCourse.findById(courseId).populate("educatorId");
    if (!student || !course) {
      return res
        .status(404)
        .json({ success: false, message: "Student or Course not found." });
    }

    // Check if already enrolled
    if (student.courses.includes(courseId)) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Student already enrolled in this course.",
        });
    }

    // Check if course requires payment
    if (course.fees && course.fees > 0) {
      // Check if payment exists and is successful
      const successfulPayment = await Payment.findOne({
        studentId,
        resourceId: courseId,
        resourceType: "course",
        status: "success",
      });

      if (!successfulPayment) {
        return res.status(402).json({
          success: false,
          message: "Payment required. Please complete payment first.",
          requiresPayment: true,
          amount: course.fees,
        });
      }
    }

    // Enroll student in course
    student.courses.push(courseId);
    await student.save();

    // Add student to course purchases and enrolledStudents (if not already present)
    if (!course.purchases.some((p) => p.studentId.toString() === studentId)) {
      course.purchases.push({ studentId });
    }

    if (
      !course.enrolledStudents.some((e) => e.studentId.toString() === studentId)
    ) {
      course.enrolledStudents.push({ studentId });
    }

    await course.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Student enrolled in course successfully.",
      });
  } catch (error) {
    console.error("Error subscribing to course:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// POST /api/subscribe-testseries
// Body: { studentId, testSeriesId }
// NOTE: This endpoint now requires payment. Use /api/payment/create-order first
exports.subscribeToTestSeries = async (req, res) => {
  try {
    const { studentId, testSeriesId } = req.body;
    if (!studentId || !testSeriesId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "studentId and testSeriesId are required.",
        });
    }
    const student = await Student.findById(studentId);
    const testSeries = await TestSeries.findById(testSeriesId).populate(
      "educatorId"
    );
    if (!student || !testSeries) {
      return res
        .status(404)
        .json({ success: false, message: "Student or Test Series not found." });
    }
    // Check if already enrolled
    if (student.tests.some((t) => t.testSeriesId.toString() === testSeriesId)) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Student already enrolled in this test series.",
        });
    }

    // Check if test series requires payment
    if (testSeries.price && testSeries.price > 0) {
      // Check if payment exists and is successful
      const successfulPayment = await Payment.findOne({
        studentId,
        resourceId: testSeriesId,
        resourceType: "testSeries",
        status: "success",
      });

      if (!successfulPayment) {
        return res.status(402).json({
          success: false,
          message: "Payment required. Please complete payment first.",
          requiresPayment: true,
          amount: testSeries.price,
        });
      }
    }

    // Enroll student in test series
    student.tests.push({ testSeriesId });
    await student.save();

    // Add student to test series purchases and enrolledStudents (if not already present)
    if (
      !testSeries.purchases?.some((p) => p.studentId.toString() === studentId)
    ) {
      if (!testSeries.purchases) testSeries.purchases = [];
      testSeries.purchases.push({ studentId });
    }

    if (
      !testSeries.enrolledStudents?.some(
        (e) => e.studentId.toString() === studentId
      )
    ) {
      if (!testSeries.enrolledStudents) testSeries.enrolledStudents = [];
      testSeries.enrolledStudents.push({ studentId });
    }

    await testSeries.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Student enrolled in test series successfully.",
      });
  } catch (error) {
    console.error("Error subscribing to test series:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// POST /api/subscribe-liveclass
// Body: { studentId, liveClassId }
// NOTE: Live classes are part of courses, so payment is handled at course level
exports.subscribeToLiveClass = async (req, res) => {
  try {
    const { studentId, liveClassId } = req.body;
    if (!studentId || !liveClassId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "studentId and liveClassId are required.",
        });
    }
    const student = await Student.findById(studentId);
    const liveClass = await LiveClass.findById(liveClassId).populate({
      path: "courseId",
      populate: { path: "educatorId" },
    });
    if (!student || !liveClass) {
      return res
        .status(404)
        .json({ success: false, message: "Student or Live Class not found." });
    }
    // Check if already enrolled
    if (student.liveClasses?.includes(liveClassId)) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Student already enrolled in this live class.",
        });
    }

    // Check if student is enrolled in the parent course
    if (liveClass.courseId) {
      const courseId = liveClass.courseId._id;
      if (!student.courses.includes(courseId.toString())) {
        // Check if payment exists for the course
        const successfulPayment = await Payment.findOne({
          studentId,
          resourceId: courseId,
          resourceType: "course",
          status: "success",
        });

        if (!successfulPayment && liveClass.courseId.fees > 0) {
          return res.status(402).json({
            success: false,
            message:
              "You must be enrolled in the course first. Payment required.",
            requiresPayment: true,
            requiresCourse: true,
            courseId: courseId,
            amount: liveClass.courseId.fees,
          });
        }
      }
    }

    // Enroll student in live class
    if (!student.liveClasses) student.liveClasses = [];
    student.liveClasses.push(liveClassId);
    await student.save();

    // Add student to live class purchases and enrolledStudents (if not already present)
    if (
      !liveClass.purchases?.some((p) => p.studentId.toString() === studentId)
    ) {
      if (!liveClass.purchases) liveClass.purchases = [];
      liveClass.purchases.push({ studentId });
    }

    if (
      !liveClass.enrolledStudents?.some(
        (e) => e.studentId.toString() === studentId
      )
    ) {
      if (!liveClass.enrolledStudents) liveClass.enrolledStudents = [];
      liveClass.enrolledStudents.push({ studentId });
    }

    await liveClass.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Student enrolled in live class successfully.",
      });
  } catch (error) {
    console.error("Error subscribing to live class:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

exports.subscribeToWebinar = async (req, res) => {
  try {
    const { studentId, webinarId } = req.body;
    if (!studentId || !webinarId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "studentId and webinarId are required.",
        });
    }
    const student = await Student.findById(studentId);
    const webinar = await Webinar.findById(webinarId).populate("educatorId");
    if (!student || !webinar) {
      return res
        .status(404)
        .json({ success: false, message: "Student or Webinar not found." });
    }
    // Check if already enrolled
    if (student.webinars?.includes(webinarId)) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Student already enrolled in this webinar.",
        });
    }

    // Check if webinar requires payment
    if (webinar.fees && webinar.fees > 0) {
      // Check if payment exists and is successful
      const successfulPayment = await Payment.findOne({
        studentId,
        resourceId: webinarId,
        resourceType: "webinar",
        status: "success",
      });

      if (!successfulPayment) {
        return res.status(402).json({
          success: false,
          message: "Payment required. Please complete payment first.",
          requiresPayment: true,
          amount: webinar.fees,
        });
      }
    }

    // Enroll student in webinar
    if (!student.webinars) student.webinars = [];
    student.webinars.push(webinarId);
    await student.save();

    // Add student to webinar purchases and enrolledStudents (if not already present)
    if (!webinar.purchases?.some((p) => p.studentId.toString() === studentId)) {
      if (!webinar.purchases) webinar.purchases = [];
      webinar.purchases.push({ studentId });
    }

    if (
      !webinar.enrolledStudents?.some(
        (e) => e.studentId.toString() === studentId
      )
    ) {
      if (!webinar.enrolledStudents) webinar.enrolledStudents = [];
      webinar.enrolledStudents.push({ studentId });
    }

    await webinar.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Student enrolled in webinar successfully.",
      });
  } catch (error) {
    console.error("Error subscribing to webinar:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

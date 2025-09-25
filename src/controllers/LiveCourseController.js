const LiveCourse = require("../models/LiveCourse");
const Educator = require("../models/Educator");
const Student = require("../models/Student");

exports.createCourse = async (req, res) => {
  try {
    const educatorId = req.params.id;

    // Check if educator exists
    const educator = await Educator.findById(educatorId);
    if (!educator) {
      return res.status(404).json({ message: "Educator not found." });
    }

    // Extract course data from request body
    const {
      specialization,
      courseClass,
      subject,
      image,
      title,
      slug,
      description,
      courseType,
      startDate,
      endDate,
      seatLimit,
      classDuration,
      fees,
      validity,
      videos,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description?.shortDesc ||
      !subject ||
      !description?.longDesc ||
      !startDate ||
      !endDate ||
      !classDuration ||
      fees === undefined
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: title, description (shortDesc, longDesc), subject, startDate, endDate, classDuration, and fees are required.",
      });
    }

    // Create new course
    const newCourse = new LiveCourse({
      specialization,
      courseClass,
      educatorId,
      subject,
      image,
      title,
      description: {
        shortDesc: description.shortDesc,
        longDesc: description.longDesc,
      },
      courseType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      seatLimit,
      classDuration,
      fees,
      validity,
      slug,
      videos,
      purchases: [],
      classes: [],
      tests: [],
    });

    // Save the course
    await newCourse.save();

    educator.courses.push(newCourse._id);
    await educator.save();

    return res.status(201).json({
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);

    // Handle duplicate title error
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Course title already exists. Please choose a different title.",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }

    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getCoursesBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.body;
    if (!specialization) {
      return res.status(400).json({ message: "Specialization is required." });
    }
    
    // Calculate validity cutoff date
    const now = new Date();
    
    const courses = await LiveCourse.find({
      specialization: specialization,
      // Only fetch courses that are still valid
      $expr: {
        $gte: [
          { $add: ["$createdAt", { $multiply: ["$validity", 24 * 60 * 60 * 1000] }] },
          now
        ]
      }
    }).populate("educatorId");
    return res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching courses by specialization:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getCoursesBySubject = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) {
      return res.status(400).json({ message: "Subject is required." });
    }

    // Calculate validity cutoff date
    const now = new Date();

    // Find courses taught by these educators that are still valid
    const courses = await LiveCourse.find({ 
      subject: subject,
      // Only fetch courses that are still valid
      $expr: {
        $gte: [
          { $add: ["$createdAt", { $multiply: ["$validity", 24 * 60 * 60 * 1000] }] },
          now
        ]
      }
    });
    return res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching courses by subject:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await LiveCourse.findById(id)
      .populate("educatorId", "firstName lastName email image subject rating")
      .populate("purchases.studentId", "name email")
      .populate("tests", "title startDate duration");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if course is still valid
    const now = new Date();
    const validUntil = new Date(course.createdAt.getTime() + (course.validity * 24 * 60 * 60 * 1000));
    
    if (now > validUntil) {
      return res.status(410).json({ message: "Course validity has expired" });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await LiveCourse.findOne({ slug: slug })
      .populate("educatorId", "name email profileImage subject rating")
      .populate("purchases.studentId", "name email")
      .populate("tests", "title startDate duration");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if course is still valid
    const now = new Date();
    const validUntil = new Date(course.createdAt.getTime() + (course.validity * 24 * 60 * 60 * 1000));
    
    if (now > validUntil) {
      return res.status(410).json({ message: "Course validity has expired" });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course by slug:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all OTO (one-to-one) courses that have zero purchases
exports.getAvailableOtoCourses = async (req, res) => {
  try {
    // Calculate validity cutoff date
    const now = new Date();
    
    const courses = await LiveCourse.find({
      courseType: "OTO",
      purchases: { $size: 0 },
      // Only fetch courses that are still valid
      $expr: {
        $gte: [
          { $add: ["$createdAt", { $multiply: ["$validity", 24 * 60 * 60 * 1000] }] },
          now
        ]
      }
    }).populate("educatorId");

    return res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching available OTO courses:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
exports.getAvailableOtoCoursesBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    // Calculate validity cutoff date
    const now = new Date();
    
    const courses = await LiveCourse.find({
      courseType: "OTO",
      subject: subject,
      purchases: { $size: 0 },
      // Only fetch courses that are still valid
      $expr: {
        $gte: [
          { $add: ["$createdAt", { $multiply: ["$validity", 24 * 60 * 60 * 1000] }] },
          now
        ]
      }
    }).populate("educatorId");

    return res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching available OTO courses:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Enroll a student into a live course
exports.enrollStudentInCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Check student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Check course exists
    const course = await LiveCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Check if already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
      (s) => s.studentId && s.studentId.toString() === studentId
    );
    if (alreadyEnrolled) {
      return res
        .status(200)
        .json({ message: "Student already enrolled in this course." });
    }

    // Check OTO constraint: only one student allowed
    if (course.courseType === "OTO" && course.enrolledStudents.length >= 1) {
      return res
        .status(400)
        .json({
          message:
            "This is a one-to-one (OTO) course and already has an enrolled student.",
        });
    }

    // Check seat limit
    if (course.enrolledStudents.length >= course.seatLimit) {
      return res.status(400).json({ message: "Course seat limit reached." });
    }

    // Enroll student
    course.enrolledStudents.push({ studentId });
    await course.save();

    // Also add course to student's courses array if not already
    const hasCourse =
      student.courses && student.courses.some((c) => c.toString() === courseId);
    if (!hasCourse) {
      student.courses = student.courses || [];
      student.courses.push(courseId);
      await student.save();
    }

    return res
      .status(201)
      .json({ message: "Student enrolled successfully.", courseId, studentId });
  } catch (error) {
    console.error("Error enrolling student in course:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid id(s) provided" });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Get LiveCourse for a student after verifying enrollment
exports.getCourseForStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Verify student is enrolled in the course (enrolledStudents)
    const enrolled = await LiveCourse.findOne({
      _id: courseId,
      "enrolledStudents.studentId": studentId,
    }).select("_id");

    if (!enrolled) {
      return res
        .status(403)
        .json({ message: "User is not enrolled in this course." });
    }

    // Fetch the course with required populations
    const course = await LiveCourse.findById(courseId)
      .populate("educatorId", "firstName lastName image")
      .populate("tests", "title description startDate duration")
      .populate("classes");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course for student:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid id(s) provided" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

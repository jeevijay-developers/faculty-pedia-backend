const LiveCourse = require("../models/LiveCourse");
const Educator = require("../models/Educator");

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
      description,
      courseType,
      startDate,
      endDate,
      seatLimit,
      classDuration,
      fees,
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
    const courses = await LiveCourse.find({
      specialization: specialization,
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

    // Find courses taught by these educators
    const courses = await LiveCourse.find({ subject: subject });
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
      .populate("educatorId", "name email profileImage subject rating")
      .populate("purchases.studentId", "name email")
      .populate("tests", "title startDate duration");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all OTO (one-to-one) courses that have zero purchases
exports.getAvailableOtoCourses = async (req, res) => {
  try {
    const courses = await LiveCourse.find({
      courseType: "OTO",
      purchases: { $size: 0 },
    }).populate("educatorId");

    return res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching available OTO courses:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

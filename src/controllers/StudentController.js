const Student = require("../models/Student");

exports.getStudntProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId)
      .populate("courses")
      .populate("followingEducators", "firstName lastName image.url")
      .populate("results");
    // .populate("tests.testSeriesId", "title description");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid student ID." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Get student's enrolled courses
exports.getStudentCourses = async (req, res) => {
  try {
    const { id } = req.params; // studentId
    const student = await Student.findById(id).populate({
      path: "courses",
      populate: { path: "educatorId", select: "firstName lastName image.url" },
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res
      .status(200)
      .json({ studentId: id, courses: student.courses || [] });
  } catch (error) {
    console.error("Error fetching student courses:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid student ID." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Get student's test results
exports.getStudentResults = async (req, res) => {
  try {
    const { id } = req.params; // studentId
    const student = await Student.findById(id).populate({
      path: "results",
      populate: [
        { path: "testId", select: "title duration" },
        { path: "seriesId", select: "title" },
      ],
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res
      .status(200)
      .json({ studentId: id, results: student.results || [] });
  } catch (error) {
    console.error("Error fetching student results:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid student ID." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Get student's following educators
exports.getStudentFollowingEducators = async (req, res) => {
  try {
    const { id } = req.params; // studentId
    const student = await Student.findById(id).populate(
      "followingEducators",
      "firstName lastName image.url specialization subjects slug"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res
      .status(200)
      .json({ studentId: id, following: student.followingEducators || [] });
  } catch (error) {
    console.error("Error fetching following educators:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid student ID." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Get student's upcoming webinars (enrolled)
exports.getStudentUpcomingWebinars = async (req, res) => {
  try {
    const { id } = req.params;
    const currentDate = new Date();

    // Find student and populate webinars that are upcoming
    const student = await Student.findById(id)
      .populate({
        path: "webinars",
        match: { date: { $gte: currentDate } }, // Only upcoming webinars
        populate: {
          path: "educatorId",
          select: "firstName lastName image specialization",
        },
      })
      .select("webinars");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Filter out null webinars and sort by date
    const upcomingWebinars = student.webinars
      .filter((webinar) => webinar !== null)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

    res.status(200).json({
      studentId: id,
      upcomingWebinars,
      count: upcomingWebinars.length,
    });
  } catch (error) {
    console.error("Error fetching student upcoming webinars:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get student's upcoming live test series (enrolled)
exports.getStudentUpcomingTestSeries = async (req, res) => {
  try {
    const { id } = req.params;
    const currentDate = new Date();

    // Find student and populate test series that are upcoming
    const student = await Student.findById(id)
      .populate({
        path: "tests.testSeriesId",
        match: {
          startDate: { $gte: currentDate }, // Only upcoming test series
          status: "active", // Only active test series
        },
        populate: {
          path: "educatorId",
          select: "firstName lastName image specialization",
        },
      })
      .select("tests");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Filter out null test series and sort by start date
    const upcomingTestSeries = student.tests
      .filter((item) => item.testSeriesId !== null)
      .map((item) => item.testSeriesId)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // Sort by start date ascending

    res.status(200).json({
      studentId: id,
      upcomingTestSeries,
      count: upcomingTestSeries.length,
    });
  } catch (error) {
    console.error("Error fetching student upcoming test series:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

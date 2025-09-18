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
    const now = new Date();
    const currentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ); // Start of current day in local timezone
    console.log(
      `Fetching upcoming webinars for student ID: ${id} at ${currentDate.toISOString()}`
    );
    console.log(
      `Local time now: ${now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })}`
    );
    console.log(
      `Using start of day: ${currentDate.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })}`
    );

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

    console.log(
      `Found ${student.webinars.length} total webinar references for student`
    );

    // Filter out null webinars and sort by date
    const upcomingWebinars = student.webinars.filter(
      (webinar) => webinar !== null
    ); // Sort by date ascending

    console.log(
      `Found ${upcomingWebinars.length} upcoming webinars after filtering`
    );

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

// Get student's live test series (all)
exports.getStudentTestSeries = async (req, res) => {
  try {
    const { id } = req.params;

    // Find student and populate all test series
    const student = await Student.findById(id)
      .populate({
        path: "tests.testSeriesId",
        populate: {
          path: "educatorId",
          select: "firstName lastName image specialization",
        },
      })
      .select("tests");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Filter out null test series and sort by start date (latest first)
    const testSeries = student.tests
      .filter((item) => item.testSeriesId !== null)
      .map((item) => item.testSeriesId)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Sort by start date descending (latest first)

    res.status(200).json({
      studentId: id,
      testSeries,
      count: testSeries.length,
    });
  } catch (error) {
    console.error("Error fetching student test series:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

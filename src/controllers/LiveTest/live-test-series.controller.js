const LiveTestSeries = require("../../models/LiveTestSeries");
const Educator = require("../../models/Educator");
const LiveTest = require("../../models/LiveTest");

// Create Test Series
exports.createTestSeries = async (req, res) => {
  try {
    const {
      title,
      educatorId,
      description,
      specialization,
      subject,
      price,
      noOfTests,
      startDate,
      endDate,
      liveTests,
      enrolledStudents,
      isCourseSpecific,
      courseId,
    } = req.body;

    // Validate end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // Create new test series
    const newTestSeries = new LiveTestSeries({
      title,
      description,
      price,
      noOfTests,
      startDate,
      specialization,
      enrolledStudents,
      subject,
      liveTests,
      endDate,
      educatorId: educatorId,
      isCourseSpecific: isCourseSpecific || false,
      courseId: isCourseSpecific ? courseId : undefined,
    });

    await newTestSeries.save();

    // Update educator's testSeries array
    await Educator.findByIdAndUpdate(educatorId, {
      $push: { testSeries: newTestSeries._id },
    });

    // Populate the response with educator data
    const populatedTestSeries = await LiveTestSeries.findById(newTestSeries._id)
      .populate("educatorId", "firstName lastName email specialization")
      .populate("courseId", "title description")
      .populate("liveTests", "title startDate duration");

    // Update the live tests with the new test series ID
    await LiveTest.updateMany(
      { _id: { $in: liveTests } },
      { $set: { testSeriesId: newTestSeries._id } }
    );

    res.status(201).json({
      success: true,
      message: "Test series created successfully",
      testSeries: populatedTestSeries,
    });
  } catch (error) {
    console.error("Error creating test series:", error);

    // Handle duplicate title error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Test series with this title already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

// Get all test series with pagination and filtering
exports.getAllTestSeries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.educatorId) filter.educatorId = req.query.educatorId;
    if (req.query.isCourseSpecific !== undefined) {
      filter.isCourseSpecific = req.query.isCourseSpecific === "true";
    }
    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (req.query.minPrice)
      filter.price = { $gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice) {
      filter.price = { ...filter.price, $lte: parseFloat(req.query.maxPrice) };
    }

    const testSeries = await LiveTestSeries.find(filter)
      .populate("educatorId", "firstName lastName email specialization image")
      .populate("courseId", "title description")
      .populate("liveTests", "title startDate duration")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LiveTestSeries.countDocuments(filter);

    res.status(200).json({
      testSeries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTestSeries: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching test series:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get test series by ID
exports.getTestSeriesById = async (req, res) => {
  try {
    const testSeries = await LiveTestSeries.findById(req.params.id)
      .populate(
        "educatorId",
        "firstName lastName email specialization image bio"
      )
      .populate("courseId", "title description")
      .populate("liveTests", "title description startDate duration")
      .populate("enrolledStudents.studentId", "name email");

    if (!testSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }

    res.status(200).json(testSeries);
  } catch (error) {
    console.error("Error fetching test series:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid test series ID" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update test series
exports.updateTestSeries = async (req, res) => {
  try {
    const testSeriesId = req.params.id;
    const educatorId = req.user.id;

    // Check if test series exists and belongs to the educator
    const existingTestSeries = await LiveTestSeries.findById(testSeriesId);
    if (!existingTestSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }

    if (existingTestSeries.educatorId.toString() !== educatorId) {
      return res.status(403).json({
        message: "You can only update your own test series",
      });
    }

    // Validate dates if both are provided
    const { startDate, endDate } = req.body;
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const updatedTestSeries = await LiveTestSeries.findByIdAndUpdate(
      testSeriesId,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("educatorId", "firstName lastName email specialization")
      .populate("courseId", "title description")
      .populate("liveTests", "title startDate duration");

    res.status(200).json({
      success: true,
      message: "Test series updated successfully",
      testSeries: updatedTestSeries,
    });
  } catch (error) {
    console.error("Error updating test series:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Test series with this title already exists",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid test series ID" });
    }

    res.status(500).json({ message: error.message });
  }
};

// Delete test series
exports.deleteTestSeries = async (req, res) => {
  try {
    const testSeriesId = req.params.id;
    const educatorId = req.user.id;

    // Check if test series exists and belongs to the educator
    const existingTestSeries = await LiveTestSeries.findById(testSeriesId);
    if (!existingTestSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }

    if (existingTestSeries.educatorId.toString() !== educatorId) {
      return res.status(403).json({
        message: "You can only delete your own test series",
      });
    }

    // Remove test series from database
    await LiveTestSeries.findByIdAndDelete(testSeriesId);

    // Remove test series from educator's testSeries array
    await Educator.findByIdAndUpdate(educatorId, {
      $pull: { testSeries: testSeriesId },
    });

    res.status(200).json({
      success: true,
      message: "Test series deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting test series:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid test series ID" });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getTestseriesBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.body;
    if (!specialization) {
      return res.status(400).json({ message: "Specialization is required." });
    }

    const testSeries = await LiveTestSeries.find({
      specialization: specialization,
    }).populate("educatorId");
    return res.status(200).json({ testSeries });
  } catch (error) {
    console.error("Error fetching test series by specialization:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getTestseriesBySubject = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) {
      return res.status(400).json({ message: "Subject is required." });
    }
    const testSeries = await LiveTestSeries.find({
      subject: subject,
    }).populate("educatorId", "name profileImage subject rating");
    return res.status(200).json({ testSeries });
  } catch (error) {
    console.error("Error fetching test series by subject:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getLiveTestSeriesById = async (req, res) => {
  try {
    const { id } = req.params;

    const testSeries = await LiveTestSeries.findById(id)
      .populate("educatorId", "name email profileImage subject rating")
      .populate("enrolledStudents.studentId", "name email")
      .populate("liveTests", "title startDate duration");

    if (!testSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }

    return res.status(200).json(testSeries);
  } catch (error) {
    console.error("Error fetching test series by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLiveTestSeriesBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const testSeries = await LiveTestSeries.findOne({ slug: slug })
      .populate("educatorId", "name email profileImage subject rating")
      .populate("enrolledStudents.studentId", "name email")
      .populate("liveTests", "title startDate duration");

    if (!testSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }

    return res.status(200).json(testSeries);
  } catch (error) {
    console.error("Error fetching test series by slug:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get live test series for a student after verifying enrollment
exports.getLiveTestSeriesForStudent = async (req, res) => {
  try {
    const { studentId, seriesId } = req.params;

    // Check if the student is enrolled in the test series
    const enrolled = await LiveTestSeries.findOne({
      _id: seriesId,
      "enrolledStudents.studentId": studentId,
    }).select("_id");

    if (!enrolled) {
      return res
        .status(403)
        .json({ message: "User is not enrolled in this test series." });
    }

    // Fetch the test series with required populations
    const testSeries = await LiveTestSeries.findById(seriesId)
      .populate("educatorId", "firstName lastName image")
      .populate(
        "liveTests",
        "title description image subject specialization startDate duration"
      );

    if (!testSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }

    return res.status(200).json(testSeries);
  } catch (error) {
    console.error("Error fetching test series for student:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid id(s) provided" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

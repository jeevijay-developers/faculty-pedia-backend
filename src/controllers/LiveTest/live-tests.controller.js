const educator = require("../../models/Educator");
const LiveTest = require("../../models/LiveTest");

exports.createTest = async (req, res) => {
  try {
    const {
      title,
      educatorId,
      description,
      subject,
      startDate,
      duration,
      overallMarks,
      specialization,
      markingType,
      questions,
      testSeriesId,
    } = req.body;

    // Create new live test
    const newLiveTest = new LiveTest({
      title,
      description,
      subject,
      startDate,
      duration,
      overallMarks,
      markingType,
      specialization,
      questions,
      testSeriesId,
      educatorId,
    });

    await newLiveTest.save();

    // Update educator's liveTests array
    await educator.findByIdAndUpdate(educatorId, {
      $push: { liveTests: newLiveTest._id },
    });

    // const isTitleExists = await LiveTest.findOne({ title });
    // if (isTitleExists) {
    //   return res
    //     .status(400)
    //     .json({ message: "A test with this title already exists." });
    // }

    // Populate the response with related data
    const populatedTest = await LiveTest.findById(newLiveTest._id)
      .populate("educatorId", "name email")
      .populate("testSeriesId", "title")
      .populate("questions", "title subject topic");

    res.status(201).json(populatedTest);
  } catch (error) {
    console.error("Error creating live test:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      // Duplicate key error
      return res
        .status(400)
        .json({ message: "A test with this title already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all live tests with pagination and filtering
exports.getAllTests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.subject) filter.subject = new RegExp(req.query.subject, "i");
    if (req.query.educatorId) filter.educatorId = req.query.educatorId;
    if (req.query.markingType) filter.markingType = req.query.markingType;
    if (req.query.testSeriesId) filter.testSeriesId = req.query.testSeriesId;

    // Date filtering
    if (req.query.startDate) {
      filter.startDate = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      filter.startDate = {
        ...filter.startDate,
        $lte: new Date(req.query.endDate),
      };
    }

    const tests = await LiveTest.find(filter)
      .populate("educatorId", "name email")
      .populate("testSeriesId", "title")
      .populate("questions", "title subject topic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LiveTest.countDocuments(filter);

    res.status(200).json({
      tests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTests: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching live tests:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get live test by ID
exports.getTestById = async (req, res) => {
  try {
    const test = await LiveTest.findById(req.params.id)
      .populate("educatorId", "name email")
      .populate("testSeriesId", "title description")
      .populate("questions");

    if (!test) {
      return res.status(404).json({ message: "Live test not found" });
    }

    res.status(200).json(test);
  } catch (error) {
    console.error("Error fetching live test:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid test ID" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get tests by educator ID
exports.getTestsByEducator = async (req, res) => {
  try {
    const educatorId = req.params.educatorId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tests = await LiveTest.find({ educatorId })
      .populate("educatorId", "name email")
      .populate("testSeriesId", "title")
      .populate("questions", "title subject topic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LiveTest.countDocuments({ educatorId });

    res.status(200).json({
      tests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTests: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching educator tests:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get tests by subject
exports.getTestsBySubject = async (req, res) => {
  try {
    const subject = req.params.subject.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tests = await LiveTest.find({ subject })
      .populate("educatorId", "name email")
      .populate("testSeriesId", "title")
      .populate("questions", "title subject topic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LiveTest.countDocuments({ subject });

    res.status(200).json({
      tests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTests: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching tests by subject:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get tests by marking type
exports.getTestsByMarkingType = async (req, res) => {
  try {
    const markingType = req.params.markingType;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tests = await LiveTest.find({ markingType })
      .populate("educatorId", "name email")
      .populate("testSeriesId", "title")
      .populate("questions", "title subject topic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LiveTest.countDocuments({ markingType });

    res.status(200).json({
      tests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTests: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching tests by marking type:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get tests by date range
exports.getTestsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const tests = await LiveTest.find({ startDate: dateFilter })
      .populate("educatorId", "name email")
      .populate("testSeriesId", "title")
      .populate("questions", "title subject topic")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await LiveTest.countDocuments({ startDate: dateFilter });

    res.status(200).json({
      tests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTests: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching tests by date range:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update live test
exports.updateTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const educatorId = req.body.educatorId || req.user?.id;

    // Check if test exists and belongs to the educator
    const existingTest = await LiveTest.findById(testId);
    if (!existingTest) {
      return res.status(404).json({ message: "Live test not found" });
    }

    if (existingTest.educatorId.toString() !== educatorId) {
      return res
        .status(403)
        .json({ message: "You can only update your own tests" });
    }

    const updateData = { ...req.body };

    const updatedTest = await LiveTest.findByIdAndUpdate(testId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("educatorId", "name email")
      .populate("testSeriesId", "title")
      .populate("questions", "title subject topic");

    res.status(200).json(updatedTest);
  } catch (error) {
    console.error("Error updating live test:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid test ID" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete live test
exports.deleteTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const educatorId = req.body.educatorId || req.user?.id;

    // Check if test exists and belongs to the educator
    const existingTest = await LiveTest.findById(testId);
    if (!existingTest) {
      return res.status(404).json({ message: "Live test not found" });
    }

    if (existingTest.educatorId.toString() !== educatorId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own tests" });
    }

    // Remove test from database
    await LiveTest.findByIdAndDelete(testId);

    // Remove test from educator's liveTests array
    await educator.findByIdAndUpdate(educatorId, {
      $pull: { liveTests: testId },
    });

    res.status(200).json({ message: "Live test deleted successfully" });
  } catch (error) {
    console.error("Error deleting live test:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid test ID" });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getLiveTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const liveTest = await LiveTest.findById(id)
      .populate("educatorId", "name email profileImage subject rating")
      .populate("testSeriesId", "title description")
      .populate("questions");

    if (!liveTest) {
      return res.status(404).json({ message: "Live test not found" });
    }

    return res.status(200).json(liveTest);
  } catch (error) {
    console.error("Error fetching live test by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLiveTestBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const liveTest = await LiveTest.findOne({ slug: slug })
      .populate("educatorId", "name email profileImage subject rating")
      .populate("testSeriesId", "title description")
      .populate("questions");

    if (!liveTest) {
      return res.status(404).json({ message: "Live test not found" });
    }

    return res.status(200).json(liveTest);
  } catch (error) {
    console.error("Error fetching live test by slug:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

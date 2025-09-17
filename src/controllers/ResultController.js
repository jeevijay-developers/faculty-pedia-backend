const Result = require("../models/Result");
const AttemptedQuestions = require("../models/AttemptedQuestions");
const Student = require("../models/Student");
const LiveTest = require("../models/LiveTest");
const LiveTestSeries = require("../models/LiveTestSeries");

exports.getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id)
      .populate("studentId", "name email")
      .populate("seriesId", "title description")
      .populate("testId", "title duration")
      .populate("attemptedQuestions.questionId");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching result by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getResultBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await Result.findOne({ slug: slug })
      .populate("studentId", "name email")
      .populate("seriesId", "title description")
      .populate("testId", "title duration")
      .populate("attemptedQuestions.questionId");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching result by slug:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.addNestTestSubmission = async (req, res) => {
  try {
    // Controller logic to handle test submission goes here
    // ✅ Step 2: Extract body
    const {
      studentId,
      seriesId,
      testId,
      totalScore,
      totalUnattempted,
      totalIncorrect,
      totalCorrect,
      obtainedScore,
      attemptedQuestions,
    } = req.body;

    // check studentId, testId, seriesId are valid ObjectIds
    const isStudent = await Student.findById(studentId);
    const isTest = await LiveTest.findById(testId);
    const isSeries = await LiveTestSeries.findById(seriesId);
    console.log(isStudent, isTest, isSeries);

    if (!isStudent || !isTest || !isSeries) {
      return res.status(400).json({ message: "Invalid IDs provided" });
    }

    // ✅ Step 1: Prevent duplicate submissions
    const existingResult = await Result.findOne({
      studentId,
      testId,
      seriesId,
    });
    if (existingResult) {
      return res.status(400).json({
        message: "You have already submitted this test.",
      });
    }
    // update the attended test

    // ✅ Step 3: Save attempted questions with Promise.all
    const savedAttempts = await Promise.all(
      attemptedQuestions.map((q) => {
        const attempt = new AttemptedQuestions({
          questionId: q.questionId,
          testId,
          testSeriesId: seriesId,
          marks: q.marks,
          status: q.status,
          selectedOption: q.selectedOption,
        });
        return attempt.save();
      })
    );

    // Collect their IDs
    const attemptIds = savedAttempts.map((q) => ({ questionId: q._id }));

    // ✅ Step 4: Save result summary
    const result = new Result({
      studentId,
      seriesId,
      testId,
      totalScore,
      totalUnattempted,
      totalIncorrect,
      totalCorrect,
      obtainedScore,
      attemptedQuestions: attemptIds,
    });

    const savedResult = await result.save();
    isStudent.results.push(savedResult._id);
    await isStudent.save();
    // ✅ Step 5: Respond
    res.status(201).json({
      message: "Test submitted successfully",
      result: savedResult,
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTestResults = async (req, res) => {
  try {
    const { seriesId, testId } = req.body;

    const results = await Result.find({
      // include studentId if you want only that student's results
      // studentId,
      testId,
      seriesId,
    }).sort({ obtainedScore: -1, createdAt: -1 }); // sort by score, then latest
    // .populate("attemptedQuestions.questionId")

    if (!results || results.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for the given IDs" });
    }

    res.status(200).json({
      message: "Fetched test results successfully",
      results,
    });
  } catch (error) {
    console.error("Error fetching test results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getStudentResults = async (req, res) => {
  try {
    const { studentId, seriesId, testId } = req.body;
    const results = await Result.findOne({
      // include studentId if you want only that student's results
      studentId,
      testId,
      seriesId,
    }).populate("attemptedQuestions.questionId");

    if (!results) {
      return res
        .status(404)
        .json({ message: "No results found for the given IDs" });
    }

    res.status(200).json({
      message: "Fetched student results successfully",
      results,
    });
  } catch (error) {
    console.error("Error fetching student results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

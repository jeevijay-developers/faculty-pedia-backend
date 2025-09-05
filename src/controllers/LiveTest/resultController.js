const AttemptedQuestions = require("../../models/AttemptedQuestions");
const Result = require("../../models/Result");

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
    // Controller logic to fetch test results goes here
    res.status(200).json({ message: "Fetched test results successfully" });
  } catch (error) {
    console.error("Error fetching test results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

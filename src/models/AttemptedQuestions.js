const mongoose = require("mongoose");

const attemptedQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveTest",
    },
    testSeriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveTestSeries",
    },
    marks: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["CORRECT", "INCORRECT", "UNATTEMPTED"],
      required: true,
    },
    selectedOption: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AttemptedQuestions", attemptedQuestionSchema);

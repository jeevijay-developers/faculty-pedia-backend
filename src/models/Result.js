const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveTestSeries",
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveTest",
      required: true,
    },
    totalCorrect: {
      type: Number,
      required: true,
    },
    totalIncorrect: {
      type: Number,
      required: true,
    },
    totalUnattempted: {
      type: Number,
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    obtainedScore: {
      type: Number,
      required: true,
    },
    attemptedQuestions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttemptedQuestions",
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);

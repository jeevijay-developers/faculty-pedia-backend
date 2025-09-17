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
      },
    ],
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

resultSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = `${this.studentId}-${this.testId}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model("Result", resultSchema);

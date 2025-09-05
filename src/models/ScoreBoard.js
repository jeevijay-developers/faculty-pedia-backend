const mongoose = require("mongoose");

const scoreBoardSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveTest",
      required: true,
    },
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveTestSeries",
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
      default: 0,
    },
    rank: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScoreBoard", scoreBoardSchema);

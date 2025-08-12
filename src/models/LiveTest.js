const mongoose = require("mongoose");

const liveTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowecase: true,
      unique: true,
    },
    description: {
      short: {
        type: String,
        required: true,
      },
      long: {
        type: String,
        required: true,
      },
    },
    image: {
      public_id: String,
      url: String,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      lowecase: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    overallMarks: {
      positive: {
        type: Number,
        required: true,
      },
      negative: {
        type: Number,
        required: true,
      },
    },
    markingType: {
      type: String,
      required: true,
      enum: ["OAM", "PQM"], // overall marks, per question marks
      default: "PQM",
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    testSeriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestSeries",
      required: true,
    },
    educatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Educator",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LiveTest", liveTestSchema);

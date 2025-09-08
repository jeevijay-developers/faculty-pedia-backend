const mongoose = require("mongoose");

const testSeriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
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
  price: {
    type: Number,
    required: true,
  },
  noOfTests: {
    type: Number,
    required: true,
    default: 1,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  image: {
    public_id: String,
    url: String,
  },
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Educator",
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  specialization: {
    type: String,
    required: true,
    enum: ["IIT-JEE", "NEET", "CBSE"],
    trim: true,
  },
  enrolledStudents: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    },
  ],
  liveTests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveTest",
    },
  ],
  isCourseSpecific: {
    type: Boolean,
    default: false,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});

module.exports = mongoose.model("LiveTestSeries", testSeriesSchema);
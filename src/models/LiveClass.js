const mongoose = require("mongoose");

const liveClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LiveCourse",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
  },
  time: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    require: true,
  },
  duration: {
    // in minutes
    type: Number,
    require: true,
  },
  liveClassLink: {
    type: String,
  },
  assetsLinks: [
    {
      name: { type: String, enum: ["PPT", "VIDEO", "PDF"] },
      link: { type: String },
    },
  ],
});

module.exports = mongoose.model("LiveClass", liveClassSchema);

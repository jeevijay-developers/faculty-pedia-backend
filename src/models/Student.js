const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  image: {
    public_id: String,
    url: String,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveCourse",
    },
  ],
  followingEducators: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Educator" },
  ],
  role: {
    type: String,
    default: "student",
  },
  tests: [
    {
      testSeriesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestSeries",
      },
    },
  ],

  results: [
    {
      // resultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Result",
      // },
    },
  ],
});

studentSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);

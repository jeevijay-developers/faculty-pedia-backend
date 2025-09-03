const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const educatorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
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
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    bio: {
      type: String,
      required: true,
      trim: true,
    },
    workExperience: [
      {
        title: {
          type: String,
          uppercase: true,
        },
        company: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    introVideoLink: String,
    qualification: [
      {
        title: {
          type: String,
          uppercase: true,
        },
        institute: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    socials: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    rating: {
      type: Number,
      default: 0,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Physics",
        "Chemistry",
        "Biology",
        "Mathematics",
        "IIT-JEE",
        "NEET",
        "CBSE",
      ],
      default: "Physics",
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveCourse",
      },
    ],
    webinars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Webinar",
      },
    ],
    testSeries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestSeries",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    yearsExperience: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

educatorSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

module.exports = mongoose.model("Educator", educatorSchema);

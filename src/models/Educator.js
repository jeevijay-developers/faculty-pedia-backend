const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    profileImage: {
      public_id: String,
      url: String,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
    },
    workExperience: [
      {
        title: {
          type: String,
          upperCase: true,
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
          upperCase: true,
        },
        institute: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    socials: {
      instagram: String,
      facebook: String,
      twitter: String,
      linkedin: String,
      youtube: String,
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
      enum: ["Physics", "Chemistry", "Biology", "Mathematics", "IIT-JEE", "NEET", "CBSE"],
      default: "Physics",
    },
    coursesAndTests: [
      {
        type: String,
        enum: ["COURSE", "TEST"],
        default: "COURSE",
        id: String,
      },
    ],
    webinars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Webinar",
      },
    ],
    followers: {
      type: String,
      default: "0",
    },
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

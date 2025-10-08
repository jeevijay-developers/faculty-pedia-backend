const mongoose = require("mongoose");
const { parseDate } = require("../helpers/utilityFunctions");

// Utility function to generate slug
function generateSlug(title, id) {
  // Take first 6 words of title, join with hyphens, and append last 6 chars of id
  const titlePart = title
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join("-");
  const idPart = id
    ? id.toString().slice(-6)
    : Math.random().toString(36).substring(2, 8);
  return `${titlePart}-${idPart}`;
}

const courseSchema = new mongoose.Schema(
  {
    specialization: {
      type: String,
      required: true,
      enum: ["IIT-JEE", "NEET", "CBSE"],
      trim: true,
    },
    courseClass: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      default: "10",
    },
    subject: {
      type: String,
      trim: true,
      lowercase: true,
    },
    educatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Educator",
      required: true,
    },
    purchases: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      },
    ],
    image: {
      public_id: String,
      url: String,
    },
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      shortDesc: {
        type: String,
        required: true,
      },
      longDesc: {
        type: String,
        required: true,
      },
    },
    courseType: {
      type: String,
      enum: ["OTA", "OTO"],
      default: "OTA",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    seatLimit: {
      type: Number,
      required: true,
      default: 1,
    },
    classDuration: {
      // in hours
      type: Number,
      required: true,
      default: 1,
    },
    fees: {
      type: Number,
      required: true,
      default: 0,
    },
    validity: {
      type: Number,
      required: true,
      min: 1,
      default: 30, // Default validity in days
    },
    videos: {
      intro: {
        type: String,
      },
      descriptionVideo: {
        type: String,
      },
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveClass",
      },
    ],
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveTest",
      },
    ],
    enrolledStudents: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
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

// Pre-save hook for date validation and slug generation
courseSchema.pre("save", function (next) {
  const START_DATE = parseDate(this.startDate);
  const END_DATE = parseDate(this.endDate);

  if (
    !START_DATE ||
    isNaN(START_DATE.getTime()) ||
    !END_DATE ||
    isNaN(END_DATE.getTime())
  ) {
    return next(new Error("Invalid class date"));
  }

  const now = new Date();

  if (START_DATE <= now) {
    return next(new Error("Start date must be in the future"));
  }

  if (END_DATE <= START_DATE) {
    return next(new Error("End date must be after the start date"));
  }

  this.startDate = START_DATE;
  this.endDate = END_DATE;

  // Generate slug if not present
  if (!this.slug && this.title && this._id) {
    this.slug = generateSlug(this.title, this._id);
  }

  next();
});

module.exports = mongoose.model("LiveCourse", courseSchema);

const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    specialization: {
      type: String,
      required: true,
      enum: ["IIT-JEE", "NEET", "CBSE"],
      default: "CBSE",
    },
    courseClass: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      default: "10",
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
      lowercase: true,
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
    videos: {
      intro: {
        type: String,
      },
      descriptionVideo: {
        type: String,
      },
    },
    classess: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveClass",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveCourse", courseSchema);

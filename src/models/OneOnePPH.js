const mongoose = require("mongoose");

const oneOnePPHSchema = new mongoose.Schema(
  {
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Educator",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      enum: ["IIT-JEE", "NEET", "CBSE"],
      required: true,
    },
    fees: {
      type: Number,
      default: 0,
      min: 0,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in hours
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OneOnePPH", oneOnePPHSchema);

const { uploadToCloudinary } = require("../helpers/cloudinary");
const Educator = require("../models/Educator");
const LiveCourse = require("../models/LiveCourse");
const LiveTest = require("../models/LiveTest");
const LiveTestSeries = require("../models/LiveTestSeries");
const Question = require("../models/Question");
const Student = require("../models/Student");
const Webinar = require("../models/Webinar");

const targetModels = {
  EDUCATOR: Educator,
  STUDENT: Student,
  LIVE_COURSE: LiveCourse,
  LIVE_TEST: LiveTest,
  TEST_SERIES: LiveTestSeries,
  QUESTION: Question,
  WEBINAR: Webinar,
};

exports.updateImage = async (req, res) => {
  try {
    // Controller logic to update an image goes here
    const { id, target, image } = req.body;
    let result = null;
    const model = targetModels[target];
    if (!model) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    result = await model.findByIdAndUpdate(
      id,
      { image: image },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({
      message: "Image updated successfully",
      updated: { id: result._id, image: result.image },
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    uploadToCloudinary(req.file.buffer)
      .then((result) => {
        return res.status(200).json({ imageUrl: result });
      })
      .catch((error) => {
        console.error("Error uploading to Cloudinary:", error);
        return res.status(500).json({ message: "Cloudinary upload failed" });
      });

    // res.status(200).json({ imageUrl: req.file.path });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

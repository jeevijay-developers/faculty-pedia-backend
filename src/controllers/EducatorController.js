const Educator = require("../models/Educator");
const FollowersCount = require("../models/FollowerCount");
const Student = require("../models/Student");

exports.updateEducatorStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    // if (!id || !status) {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid educator ID or status." });
    // }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const result = await Educator.updateOne({ _id: id }, { status: status });

    if (result.nModified === 0) {
      return res.status(404).json({ message: "Educator not found." });
    }

    return res
      .status(200)
      .json({ message: "Educator status updated successfully.", result });
  } catch (error) {
    console.error("Error updating educator status:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getEducatorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.body;
    if (!specialization) {
      return res.status(400).json({ message: "Specialization is required." });
    }

    const educators = await Educator.find({
      specialization: specialization,
      status: "active",
    }).populate("followers");
    return res.status(200).json({ educators });
  } catch (error) {
    console.error("Error fetching educators by specialization:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getEducatorsBySubject = async (req, res) => {
  try {
    const { subject } = req.body;

    if (!subject) {
      return res.status(400).json({ message: "Subject is required." });
    }
    const educators = await Educator.find({
      subject: subject,
      status: "active",
    }).populate("followers");
    return res.status(200).json({ educators });

  } catch (error) {
    console.error("Error fetching educators by subject:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

exports.getEducatorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Educator ID is required." });
    }
    const educator = await Educator.findById(id);
    if (!educator) {
      return res.status(404).json({ message: "Educator not found." });
    }
    return res.status(200).json(educator);
  } catch (error) {
    console.error("Error fetching educator by ID:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

exports.getEducatorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ message: "Educator slug is required." });
    }
    const educator = await Educator.findOne({ slug: slug });
    if (!educator) {
      return res.status(404).json({ message: "Educator not found." });
    }
    return res.status(200).json(educator);
  } catch (error) {
    console.error("Error fetching educator by slug:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
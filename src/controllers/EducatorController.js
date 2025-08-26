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

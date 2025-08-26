const Educator = require("../models/Educator");
const FollowersCount = require("../models/FollowerCount");
const Student = require("../models/Student");

exports.updateFollowerCount = async (req, res) => {
  try {
    const { educatorid, studentid, status } = req.body;

    if (!educatorid || !studentid) {
      return res
        .status(400)
        .json({ message: "Invalid educator or student ID." });
    }

    // Validate existence
    const [EDUCATOR, STUDENT] = await Promise.all([
      Educator.findById(educatorid),
      Student.findById(studentid),
    ]);
    if (!EDUCATOR)
      return res.status(404).json({ message: "Educator not found." });
    if (!STUDENT)
      return res.status(404).json({ message: "Student not found." });

    if (status === "follow") {
      // Atomically add without duplicates
      const [updatedEducator, updatedStudent] = await Promise.all([
        Educator.findByIdAndUpdate(
          educatorid,
          { $addToSet: { followers: studentid } },
          { new: true }
        ),
        Student.findByIdAndUpdate(
          studentid,
          { $addToSet: { followingEducators: educatorid } },
          { new: true }
        ),
      ]);

      // Update follower count
      const count = updatedEducator.followers.length;
      await FollowersCount.findOneAndUpdate(
        { educatorId: educatorid },
        { educatorId: educatorid, followerCount: count },
        { upsert: true, new: true }
      );

      return res
        .status(200)
        .json({ message: "Student is now following the educator." });
    } else if (status === "unfollow") {
      const [updatedEducator, updatedStudent] = await Promise.all([
        Educator.findByIdAndUpdate(
          educatorid,
          { $pull: { followers: studentid } },
          { new: true }
        ),
        Student.findByIdAndUpdate(
          studentid,
          { $pull: { followingEducators: educatorid } },
          { new: true }
        ),
      ]);

      const count = updatedEducator.followers.length;
      await FollowersCount.findOneAndUpdate(
        { educatorId: educatorid },
        { educatorId: educatorid, followerCount: count },
        { upsert: true, new: true }
      );

      return res
        .status(200)
        .json({ message: "Student has unfollowed the educator." });
    } else {
      return res.status(400).json({ message: "Invalid status." });
    }
  } catch (error) {
    console.error("Error updating follower count:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

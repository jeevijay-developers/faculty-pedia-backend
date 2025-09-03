const Educator = require("../models/Educator");
const Webinar = require("../models/Webinar");
const Webinar = require("../models/Webinar");

exports.createNewWebinar = async (req, res) => {
  try {
    const EDUCATOR = await Educator.findById(req.params.id);
    if (!EDUCATOR) {
      return res.status(404).json({ message: "Educator not found." });
    }
    const webinarData = req.body;
    const newWebinar = new Webinar({
      ...webinarData,
      teacherId: req.params.id,
    });
    await newWebinar.save();
    // also add this webinar to educator's webinars array
    EDUCATOR.webinars.push(newWebinar._id);
    await EDUCATOR.save();

    return res
      .status(201)
      .json({ message: "Webinar created successfully", newWebinar });
  } catch (error) {
    console.error("Error creating webinar:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getAllUpcommingWebinars = async (req, res) => {
  try {
    const currentDate = new Date();
    const webinars = await Webinar.find({ date: { $gte: currentDate } })
      .sort({ date: 1 })
      .populate("teacherId", "name email"); // populate educator details
    return res.status(200).json(webinars);
  } catch (error) {
    console.error("Error fetching webinars:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Additional controller methods can be added here

exports.attendWebinar = async (req, res) => {
  const webinarId = req.params.webId;
  const { studentId } = req.body;

  try {
    const webinar = await Webinar.findById(webinarId);
    if (!webinar) {
      return res.status(404).json({ message: "Webinar not found." });
    }
    const isEnrolled = webinar.enrolledStudents.some(
      (student) => student.toString() === studentId
    );
    if (isEnrolled) {
      return res
        .status(200)
        .json({ message: "Already enrolled in the webinar." });
    }
    return res
      .status(400)
      .json({ message: "Enroll in the webinar before attending." });
  } catch (error) {
    console.error("Error joining webinar:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.enrollWebinar = async (req, res) => {
  const webinarId = req.params.webId;
  const studentId = req.body.studentId;

  try {
    const webinar = await Webinar.findById(webinarId);
    if (!webinar) {
      return res.status(404).json({ message: "Webinar not found." });
    }
    const isEnrolled = webinar.enrolledStudents.some(
      (student) => student.toString() === studentId
    );
    if (isEnrolled) {
      return res
        .status(200)
        .json({ message: "Already enrolled in the webinar." });
    }
    webinar.enrolledStudents.push(studentId);
    await webinar.save();
    return res
      .status(201)
      .json({ message: "Successfully enrolled in the webinar." });
  } catch (error) {
    console.error("Error enrolling in webinar:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

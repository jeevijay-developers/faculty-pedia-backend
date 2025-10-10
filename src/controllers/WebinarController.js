const Educator = require("../models/Educator");
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
      educatorId: req.params.id,
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
      .populate("educatorId", "name email"); // populate educator details
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

  if (!studentId) {
    return res
      .status(400)
      .json({ message: "studentId is required in request body." });
  }

  try {
    const webinar = await Webinar.findById(webinarId);
    if (!webinar) {
      return res.status(404).json({ message: "Webinar not found." });
    }
    // console.log(studentId);

    // console.log(webinar.enrolledStudents);

    const isEnrolled = webinar.enrolledStudents.some(
      (student) => student.studentId.toString() === studentId
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
  const studentId = req.body && req.body.studentId;

  if (!studentId) {
    return res
      .status(400)
      .json({ message: "studentId is required in request body." });
  }

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

exports.getWebinarsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.body;
    if (!specialization) {
      return res.status(400).json({ message: "Specialization is required." });
    }
    const webinars = await Webinar.find({
      specialization: specialization,
    }).populate("educatorId");
    return res.status(200).json({ webinars });
  } catch (error) {
    console.error("Error fetching webinars by specialization:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getWebinarsBySubject = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) {
      return res.status(400).json({ message: "Subject is required." });
    }
    const webinars = await Webinar.find({
      subject: subject,
    }).populate("educatorId", "name profileImage subject rating");
    return res.status(200).json({ webinars });
  } catch (error) {
    console.error("Error fetching webinars by subject:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getWebinarById = async (req, res) => {
  try {
    const { id } = req.params;

    const webinar = await Webinar.findById(id)
      .populate(
        "educatorId",
        "firstName lastName email image.url subject rating specialization"
      )
      .populate("enrolledStudents", "name email");

    if (!webinar) {
      return res.status(404).json({ message: "Webinar not found" });
    }

    return res.status(200).json(webinar);
  } catch (error) {
    console.error("Error fetching webinar by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getWebinarBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const webinar = await Webinar.findOne({ slug: slug })
      .populate("educatorId", "name email profileImage subject rating")
      .populate("enrolledStudents", "name email");

    if (!webinar) {
      return res.status(404).json({ message: "Webinar not found" });
    }

    return res.status(200).json(webinar);
  } catch (error) {
    console.error("Error fetching webinar by slug:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getWebinarsByEducator = async (req, res) => {
  try {
    const { educatorId } = req.params;

    // Pagination parameters
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit =
      parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Optional filters
    const { status, webinarType, subject } = req.query;

    // Build filter object
    const filter = { educatorId };

    if (status === "upcoming") {
      filter.date = { $gte: new Date() };
    } else if (status === "past") {
      filter.date = { $lt: new Date() };
    }

    if (webinarType && ["OTO", "OTA"].includes(webinarType)) {
      filter.webinarType = webinarType;
    }

    if (subject) {
      filter.subject = { $regex: subject, $options: "i" };
    }

    const [webinars, total] = await Promise.all([
      Webinar.find(filter)
        .populate(
          "educatorId",
          "firstName lastName image specialization rating"
        )
        .sort({ date: -1 }) // Latest first
        .skip(skip)
        .limit(limit),
      Webinar.countDocuments(filter),
    ]);

    res.status(200).json({
      educatorId,
      webinars,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalWebinars: total,
    });
  } catch (error) {
    console.error("Error fetching webinars by educator:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update webinar
exports.updateWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      webinarType,
      time,
      subject,
      specialization,
      date,
      seatLimit,
      image,
      webinarLink,
      assetsLinks,
    } = req.body;

    // Find the webinar
    const webinar = await Webinar.findById(id);
    if (!webinar) {
      return res.status(404).json({ message: "Webinar not found" });
    }

    // Build update object with only allowed fields
    const updateFields = {};
    if (description !== undefined) updateFields.description = description;
    if (webinarType !== undefined) updateFields.webinarType = webinarType;
    if (time !== undefined) updateFields.time = time;
    if (subject !== undefined) updateFields.subject = subject;
    if (specialization !== undefined)
      updateFields.specialization = specialization;
    if (date !== undefined) updateFields.date = new Date(date);
    if (seatLimit !== undefined) updateFields.seatLimit = seatLimit;
    if (image !== undefined) updateFields.image = image;
    if (webinarLink !== undefined) updateFields.webinarLink = webinarLink;
    if (assetsLinks !== undefined) updateFields.assetsLinks = assetsLinks;

    // Update the webinar
    const updatedWebinar = await Webinar.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).populate("educatorId", "firstName lastName image specialization");

    return res.status(200).json({
      message: "Webinar updated successfully",
      webinar: updatedWebinar,
    });
  } catch (error) {
    console.error("Error updating webinar:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid webinar ID" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete webinar
exports.deleteWebinar = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the webinar
    const webinar = await Webinar.findById(id);
    if (!webinar) {
      return res.status(404).json({ message: "Webinar not found" });
    }

    // Remove webinar from educator's webinars array
    await Educator.findByIdAndUpdate(webinar.educatorId, {
      $pull: { webinars: id },
    });

    // Delete the webinar
    await Webinar.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Webinar deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting webinar:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid webinar ID" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

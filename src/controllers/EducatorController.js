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

exports.getAllEducators = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, specialization } = req.query;
    
    let filter = { status: "active" };
    
    // Add filters if provided
    if (subject) {
      filter.subject = { $regex: subject, $options: 'i' };
    }
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    const educators = await Educator.find(filter)
      .populate("followers")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Educator.countDocuments(filter);

    return res.status(200).json({
      educators,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Error fetching all educators:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.createSampleEducators = async (req, res) => {
  try {
    // Check if educators already exist
    const existingCount = await Educator.countDocuments();
    if (existingCount > 0) {
      return res.status(200).json({ 
        message: "Sample educators already exist",
        count: existingCount 
      });
    }

    const sampleEducators = [
      {
        firstName: "suresh",
        lastName: "nair",
        password: await require("bcrypt").hash("password123", 10),
        mobileNumber: "+919876543210",
        email: "suresh.nair@example.com",
        slug: "suresh-nair-physics",
        bio: "Physics educator specializing in mechanics and thermodynamics for NEET students.",
        specialization: "NEET",
        subject: "Physics",
        rating: 4.5,
        status: "active",
      },
      {
        firstName: "meera",
        lastName: "sharma",
        password: await require("bcrypt").hash("password123", 10),
        mobileNumber: "+919876543211",
        email: "meera.sharma@example.com",
        slug: "meera-sharma-math",
        bio: "Expert in algebra, calculus, and IIT-JEE coaching.",
        specialization: "IIT-JEE",
        subject: "Math",
        rating: 4.8,
        status: "active",
      },
      {
        firstName: "anita",
        lastName: "verma",
        password: await require("bcrypt").hash("password123", 10),
        mobileNumber: "+919876543212",
        email: "anita.verma@example.com",
        slug: "anita-verma-chemistry",
        bio: "Specialist in organic and inorganic chemistry for JEE/NEET.",
        specialization: "NEET",
        subject: "Chemistry",
        rating: 4.6,
        status: "active",
      },
      {
        firstName: "ankit",
        lastName: "verma",
        password: await require("bcrypt").hash("password123", 10),
        mobileNumber: "+919876543213",
        email: "ankit.verma@example.com",
        slug: "ankit-verma-biology",
        bio: "Specialist in Biology for NEET preparation.",
        specialization: "NEET",
        subject: "Biology",
        rating: 4.6,
        status: "active",
      },
    ];

    const created = await Educator.insertMany(sampleEducators);
    
    return res.status(201).json({
      message: "Sample educators created successfully",
      count: created.length,
      educators: created
    });
  } catch (error) {
    console.error("Error creating sample educators:", error);
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
};

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
    return res.status(200).json({ educator });
  } catch (error) {
    console.error("Error fetching educator by ID:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
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

const Educator = require("../models/Educator");
const Student = require("../models/Student");
const signUpStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();

    res
      .status(201)
      .json({ message: "Student signed up successfully", student });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const signUpEducator = async (req, res) => {
  try {
    const educator = new Educator(req.body);
    await educator.save();
    res
      .status(201)
      .json({ message: "Educator signed up successfully", educator });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { signUpStudent, signUpEducator };

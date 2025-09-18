const { comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../middlewares/jwt.config");
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
    console.log(error);
    
    res.status(500).json({ error: "Error in signUpStudent controller" });
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

const loginStudent = async (req, res) => {
  // Login logic to be implemented
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await Student.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // compare password (hash comparison to be implemented)
    if (await comparePassword(password, user.password)) {
      // generate token (JWT or similar) - to be implemented
      // console.log(user);

      const TOKEN = generateToken({ userid: user._id, email: user.email });
      return res.status(200).json({ message: "Login successful", user, TOKEN });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Internal server error" });
  }
};

const loginEducator = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const educator = await Educator.findOne({ email });
    if (!educator) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // compare password (hash comparison to be implemented)
    if (await comparePassword(password, educator.password)) {
      // generate token (JWT or similar) - to be implemented
      // console.log(user);

      const TOKEN = generateToken({
        userid: educator._id,
        email: educator.email,
      });
      return res
        .status(200)
        .json({ message: "Login successful", educator, TOKEN });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { signUpStudent, signUpEducator, loginStudent, loginEducator };

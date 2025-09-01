const {
  validateEmail,
  validateMobileNumber,
} = require("../middlewares/customValidator.config");
const Student = require("../models/Student");

exports.updateStudentsEmailNameAndMobileNumber = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, email, mobileNumber } = req.body;
    const isStudent = await Student.findById(studentId);
    if (!isStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Only update if provided and not empty
    if (name && name.trim()) isStudent.name = name.trim();
    if (email) isStudent.email = email;
    if (mobileNumber) isStudent.mobileNumber = mobileNumber;

    await isStudent.save();

    res.status(200).json({ message: "Student details updated successfully" });
  } catch (error) {
    console.error("Error updating student details:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

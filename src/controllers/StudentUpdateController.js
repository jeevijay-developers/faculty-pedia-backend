const {
  validateEmail,
  validateMobileNumber,
} = require("../middlewares/customValidator.config");
const Student = require("../models/Student");
const { uploadToCloudinary } = require("../helpers/cloudinary");

exports.updateStudentProfile = async (req, res) => {
  try {
    const { studentId, id } = req.params;
    const finalStudentId = studentId || id; // Handle both parameter names
    const { name, email, mobileNumber } = req.body;
    const imageFile = req.file; // Get uploaded file from multer
    
    const isStudent = await Student.findById(finalStudentId);
    if (!isStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (!isStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Check if email is being changed and validate uniqueness
    if (email && email !== isStudent.email) {
      const existingStudent = await Student.findOne({ 
        email: email,
        _id: { $ne: finalStudentId } // Exclude current student
      });
      
      if (existingStudent) {
        return res.status(400).json({ 
          message: "Email already in use by another student" 
        });
      }
    }

    // ✅ Check if mobile number is being changed and validate uniqueness
    if (mobileNumber && mobileNumber !== isStudent.mobileNumber) {
      const existingStudent = await Student.findOne({ 
        mobileNumber: mobileNumber,
        _id: { $ne: finalStudentId } // Exclude current student
      });
      
      if (existingStudent) {
        return res.status(400).json({ 
          message: "Mobile number already in use by another student" 
        });
      }
    }

    // ✅ Only update if provided and not empty
    if (name && name.trim()) isStudent.name = name.trim();
    if (email) isStudent.email = email;
    if (mobileNumber) isStudent.mobileNumber = mobileNumber;

    // ✅ Handle profile image update
    if (imageFile) {
      try {
        // Upload new image to cloudinary
        const uploadResult = await uploadToCloudinary(imageFile.buffer);
        
        // Update student profile image
        isStudent.image = {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
        };
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
        return res.status(400).json({ 
          message: "Failed to upload profile image. Please try again." 
        });
      }
    }

    await isStudent.save();

    res.status(200).json({ 
      message: "Student details updated successfully",
      student: {
        _id: isStudent._id,
        name: isStudent.name,
        email: isStudent.email,
        mobileNumber: isStudent.mobileNumber,
        image: isStudent.image, // Also include original field name for backward compatibility
      }
    });
  } catch (error) {
    console.error("Error updating student details:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// Alias for backward compatibility
exports.updateStudentsEmailNameAndMobileNumber = exports.updateStudentProfile;

const Blog = require("../models/Blog");
const Educator = require("../models/Educator");
const Student = require("../models/Student");
const Webinar = require("../models/Webinar");
exports.validateMobileNumber = async (value) => {
  // const mobileNumberPattern = /^\d{10}$/; // Example pattern for a 10-digit number
  // if (!mobileNumberPattern.test(value)) {
  //   throw new Error("Invalid mobile number format");
  // }

  const student = await Student.findOne({ mobileNumber: value });
  if (student) {
    throw new Error("Mobile number already in use by a student");
  }

  const educator = await Educator.findOne({ mobileNumber: value });
  if (educator) {
    throw new Error("Mobile number already in use by an educator");
  }

  return true; // ✅ return true when validation passes
};

exports.validateEmail = async (value) => {
  const student = await Student.findOne({ email: value });
  if (student) {
    throw new Error("Email already in use by a student");
  }

  const educator = await Educator.findOne({ email: value });
  if (educator) {
    throw new Error("Email already in use by an educator");
  }

  return true; // ✅ return true when validation passes
};

exports.validateWebinarTitle = async (value) => {
  const webinar = await Webinar.findOne({ title: value });
  if (webinar) {
    throw new Error("Webinar title already in use");
  }
  return true; // ✅ return true when validation passes
};

exports.validateBlogTitle = async (value) => {
  const blog = await Blog.findOne({ title: value });
  if (blog) {
    throw new Error("Blog title already in use");
  }
  return true; // ✅ return true when validation passes
};

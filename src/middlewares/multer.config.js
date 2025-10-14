const multer = require("multer");

const storate = multer.memoryStorage();

const upload = multer({
  storage: storate,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  uploadSingleImage: upload.single("image"),
  uploadMultipleImages: upload.array("images", 5),
  uploadProfileImage: upload.single("image"), // Changed from "profileImage" to "image"
};

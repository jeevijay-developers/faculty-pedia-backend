const { uploadImage } = require("../controllers/ImageUpdateController");
const { uploadSingleImage } = require("../middlewares/multer.config");

const router = require("express").Router();

router.post("/upload-image", uploadSingleImage, uploadImage);

module.exports = router;

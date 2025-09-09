const mongoose = require("mongoose");

// Utility function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove duplicate hyphens
};

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String, // SEO-friendly URL
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      short: {
        type: String,
        required: true,
      },
      long: {
        type: String,
        required: true,
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Educator", // assuming you have a Educator model
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    image: {
      public_id: String,
      url: String,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      enum: ["IIT-JEE", "NEET", "CBSE"],
    },
    subject: {
      type: String,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to auto-generate slug from title
blogSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = generateSlug(this.title);
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);

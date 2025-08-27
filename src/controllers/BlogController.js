const Blog = require("../models/Blog");

exports.createNewBlog = async (req, res) => {
  try {
    // Controller logic to create a blog post goes herecop
    const blog = await Blog.create(req.body);

    res.status(201).json({ message: "Blog post created successfully" });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // Fetch all blogs, sorted by creation date (newest first)
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

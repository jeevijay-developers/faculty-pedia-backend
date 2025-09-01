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
    // Pagination parameters
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit =
      parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Blog.countDocuments(),
    ]);

    res.status(200).json({
      blogs,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLatestBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching latest blogs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

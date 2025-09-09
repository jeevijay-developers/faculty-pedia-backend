const Blog = require("../models/Blog");

exports.createNewBlog = async (req, res) => {
  try {
    // Controller logic to create a blog post goes here
    await Blog.create(req.body);

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

exports.getBlogsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.body;

    // Pagination parameters
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit =
      parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find({ specialization: specialization.toUpperCase() })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author"),
      Blog.countDocuments({ specialization: specialization.toUpperCase() }),
    ]);

    res.status(200).json({
      blogs,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
      specialization,
    });
  } catch (error) {
    console.error("Error fetching blogs by specialization:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBlogsBySubject = async (req, res) => {
  try {
    const { subject } = req.body;

    // Pagination parameters
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit =
      parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find({ subject: subject.toLowerCase() })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments({ subject: subject.toLowerCase() }),
    ]);

    res.status(200).json({
      blogs,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
      subject,
    });
  } catch (error) {
    console.error("Error fetching blogs by subject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

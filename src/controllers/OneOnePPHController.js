const OneOnePPH = require("../models/OneOnePPH");

// Create a new PPH query
exports.createPPHQuery = async (req, res) => {
  try {
    const {
      educator,
      subject,
      specialization,
      preferredDate,
      fees,
      duration,
      message,
    } = req.body;

    const newPPHQuery = new OneOnePPH({
      educator,
      subject,
      specialization,
      preferredDate: new Date(preferredDate), // Convert to Date object
      fees,
      duration,
      message,
    });

    await newPPHQuery.save();

    res.status(201).json({
      message: "PPH query created successfully",
      pphQuery: newPPHQuery,
    });
  } catch (error) {
    console.error("Error creating PPH query:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all PPH queries for an educator
exports.getPPHQueriesByEducator = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const queries = await OneOnePPH.find({ educator: educatorId });
    res.status(200).json({ queries });
  } catch (error) {
    console.error("Error fetching PPH queries by educator:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all PPH queries for a student
exports.getPPHQueriesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const queries = await OneOnePPH.find({ student: studentId }).populate(
      "educator",
      "name email"
    );
    res.status(200).json({ queries });
  } catch (error) {
    console.error("Error fetching PPH queries by student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single PPH query by ID
exports.getPPHQueryById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = await OneOnePPH.findById(id)
      .populate("educator", "name email")
      .populate("student", "name email");
    if (!query) {
      return res.status(404).json({ message: "PPH query not found" });
    }
    res.status(200).json(query);
  } catch (error) {
    console.error("Error fetching PPH query by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add new Edit function
exports.updatePPHQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Convert preferredDate if provided
    if (updates.preferredDate) {
      updates.preferredDate = new Date(updates.preferredDate);
    }

    const updatedPPHQuery = await OneOnePPH.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("educator", "firstName lastName image specialization");

    if (!updatedPPHQuery) {
      return res.status(404).json({ message: "PPH query not found" });
    }

    res.status(200).json({
      message: "PPH query updated successfully",
      pphQuery: updatedPPHQuery,
    });
  } catch (error) {
    console.error("Error updating PPH query:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add new Delete function
exports.deletePPHQuery = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPPHQuery = await OneOnePPH.findByIdAndDelete(id);

    if (!deletedPPHQuery) {
      return res.status(404).json({ message: "PPH query not found" });
    }

    res.status(200).json({
      message: "PPH query deleted successfully",
      pphQuery: deletedPPHQuery,
    });
  } catch (error) {
    console.error("Error deleting PPH query:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

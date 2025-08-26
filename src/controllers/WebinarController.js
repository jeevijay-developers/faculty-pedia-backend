const Educator = require("../models/Educator");

exports.createNewWebinar = async (req, res) => {
  try {
    const EDUCATOR = await Educator.findById(req.params.id);
    if (!EDUCATOR) {
      return res.status(404).json({ message: "Educator not found." });
    }
    const webinarData = req.body;
    const newWebinar = new Webinar({
      ...webinarData,
      teacherId: req.params.id,
    });
    await newWebinar.save();
    // also add this webinar to educator's webinars array
    EDUCATOR.webinars.push(newWebinar._id);
    await EDUCATOR.save();

    return res
      .status(201)
      .json({ message: "Webinar created successfully", newWebinar });
  } catch (error) {
    console.error("Error creating webinar:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

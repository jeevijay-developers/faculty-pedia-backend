const Educator = require("../models/Educator");

exports.updateNameEmailMobileNumberAndBio = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const { firstName, lastName, email, mobileNumber, bio, introVideoLink } =
      req.body;
    const isEducator = await Educator.findById(educatorId);
    if (!isEducator) {
      return res.status(404).json({ message: "Educator not found" });
    }
    // ✅ Only update if provided and not empty
    if (firstName && firstName.trim()) isEducator.firstName = firstName.trim();
    if (lastName && lastName.trim()) isEducator.lastName = lastName.trim();
    if (bio && bio.trim()) isEducator.bio = bio.trim();
    if (introVideoLink) isEducator.introVideoLink = introVideoLink;
    if (email) isEducator.email = email;
    if (mobileNumber) isEducator.mobileNumber = mobileNumber;

    await isEducator.save();

    res.status(200).json({ message: "Educator details updated successfully" });
  } catch (error) {
    console.error("Error updating educator details:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

exports.updateWorkExperience = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const { workExperience } = req.body;
    const isEducator = await Educator.findById(educatorId);
    if (!isEducator) {
      return res.status(404).json({ message: "Educator not found" });
    }
    if (!Array.isArray(workExperience)) {
      return res
        .status(400)
        .json({ message: "workExperience must be an array" });
    }
    isEducator.workExperience = workExperience;
    await isEducator.save();
    res
      .status(200)
      .json({ message: "Educator work experience updated successfully" });
  } catch (error) {
    console.error("Error updating educator work experience:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateQualification = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const { qualification } = req.body;
    const isEducator = await Educator.findById(educatorId);
    if (!isEducator) {
      return res.status(404).json({ message: "Educator not found" });
    }
    if (!Array.isArray(qualification)) {
      return res
        .status(400)
        .json({ message: "qualification must be an array" });
    }
    isEducator.qualification = qualification;
    await isEducator.save();
    res
      .status(200)
      .json({ message: "Educator qualification updated successfully" });
  } catch (error) {
    console.error("Error updating educator qualification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateSocialLinks = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const { socials } = req.body;
    const isEducator = await Educator.findById(educatorId);
    if (!isEducator) {
      return res.status(404).json({ message: "Educator not found" });
    }

    if (socials.linkedin) isEducator.socials.linkedin = socials.linkedin;
    if (socials.twitter) isEducator.socials.twitter = socials.twitter;
    if (socials.facebook) isEducator.socials.facebook = socials.facebook;
    if (socials.instagram) isEducator.socials.instagram = socials.instagram;
    if (socials.youtube) isEducator.socials.youtube = socials.youtube;

    await isEducator.save();
    res
      .status(200)
      .json({ message: "Educator social links updated successfully" });
  } catch (error) {
    console.error("Error updating educator social links:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateSpecializationAndExperience = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const { specialization, yearsExperience } = req.body;
    const isEducator = await Educator.findById(educatorId);
    if (!isEducator) {
      return res.status(404).json({ message: "Educator not found" });
    }
    if (specialization) isEducator.specialization = specialization;
    if (yearsExperience !== undefined)
      isEducator.yearsExperience = yearsExperience;
    await isEducator.save();
    res
      .status(200)
      .json({ message: "Educator specialization updated successfully" });
  } catch (error) {
    console.error("Error updating educator specialization:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

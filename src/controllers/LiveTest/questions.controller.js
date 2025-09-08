const question = require("../../models/Question");
const educator = require("../../models/Educator");
const { uploadToCloudinary } = require("../../helpers/cloudinary");

exports.createQuestion = async (req, res) => {
  try {
    const educatorId = req.body.educatorId; // Get educator ID from verified token
    let questionData = { ...req.body, educatorId };

    // Handle question image upload if present
    if (req.files && req.files.questionImage) {
      const questionImageResult = await uploadToCloudinary(req.files.questionImage[0].buffer);
      questionData.image = {
        public_id: questionImageResult.public_id,
        url: questionImageResult.url,
      };
    }

    // Handle option images upload if present
    if (req.files) {
      const optionKeys = ['A', 'B', 'C', 'D'];
      
      for (const key of optionKeys) {
        const optionImageKey = `option${key}Image`;
        if (req.files[optionImageKey]) {
          const optionImageResult = await uploadToCloudinary(req.files[optionImageKey][0].buffer);
          
          // Initialize option if it doesn't exist
          if (!questionData.options) questionData.options = {};
          if (!questionData.options[key]) questionData.options[key] = {};
          
          questionData.options[key].image = {
            public_id: optionImageResult.public_id,
            url: optionImageResult.url,
          };
        }
      }
    }

    const newQuestion = new question(questionData);
    await newQuestion.save();

    // Add the question to the educator's questions array
    await educator.findByIdAndUpdate(educatorId, {
      $push: { questions: newQuestion._id },
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all questions with pagination and filtering
exports.getAllQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.subject) filter.subject = new RegExp(req.query.subject, 'i');
    if (req.query.topic) filter.topic = new RegExp(req.query.topic, 'i');
    if (req.query.educatorId) filter.educatorId = req.query.educatorId;

    const questions = await question
      .find(filter)
      .populate('educatorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await question.countDocuments(filter);

    res.status(200).json({
      questions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalQuestions: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const questionData = await question
      .findById(req.params.id)
      .populate('educatorId', 'name email');

    if (!questionData) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json(questionData);
  } catch (error) {
    console.error("Error fetching question:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid question ID" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get questions by educator ID
exports.getQuestionsByEducator = async (req, res) => {
  try {
    const educatorId = req.params.educatorId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await question
      .find({ educatorId })
      .populate('educatorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      if(questions.length === 0){
        return res.status(404).json({ message: "No questions found for this educator" });
      }
    const total = await question.countDocuments({ educatorId });

    res.status(200).json({
      questions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalQuestions: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching educator questions:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const educatorId = req.user.id;

    // Check if question exists and belongs to the educator
    const existingQuestion = await question.findById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (existingQuestion.educatorId.toString() !== educatorId) {
      return res.status(403).json({ message: "You can only update your own questions" });
    }

    let updateData = { ...req.body };

    // Handle question image upload if present
    if (req.files && req.files.questionImage) {
      const questionImageResult = await uploadToCloudinary(req.files.questionImage[0].buffer);
      updateData.image = {
        public_id: questionImageResult.public_id,
        url: questionImageResult.url,
      };
    }

    // Handle option images upload if present
    if (req.files) {
      const optionKeys = ['A', 'B', 'C', 'D'];
      
      for (const key of optionKeys) {
        const optionImageKey = `option${key}Image`;
        if (req.files[optionImageKey]) {
          const optionImageResult = await uploadToCloudinary(req.files[optionImageKey][0].buffer);
          
          // Initialize option if it doesn't exist
          if (!updateData.options) updateData.options = existingQuestion.options || {};
          if (!updateData.options[key]) updateData.options[key] = existingQuestion.options?.[key] || {};
          
          updateData.options[key].image = {
            public_id: optionImageResult.public_id,
            url: optionImageResult.url,
          };
        }
      }
    }

    const updatedQuestion = await question.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true, runValidators: true }
    ).populate('educatorId', 'name email');

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("Error updating question:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid question ID" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const educatorId = req.user.id;

    // Check if question exists and belongs to the educator
    const existingQuestion = await question.findById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (existingQuestion.educatorId.toString() !== educatorId) {
      return res.status(403).json({ message: "You can only delete your own questions" });
    }

    // Remove question from database
    await question.findByIdAndDelete(questionId);

    // Remove question from educator's questions array
    await educator.findByIdAndUpdate(educatorId, {
      $pull: { questions: questionId }
    });

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid question ID" });
    }
    res.status(500).json({ message: error.message });
  }
};

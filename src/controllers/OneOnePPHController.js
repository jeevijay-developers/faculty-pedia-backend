const OneOnePPH = require('../models/OneOnePPH');

// Create a new PPH query
exports.createPPHQuery = async (req, res) => {
  try {
    const query = new OneOnePPH(req.body);
    await query.save();
    res.status(201).json({ message: 'PPH query created successfully', query });
  } catch (error) {
    console.error('Error creating PPH query:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all PPH queries for an educator
exports.getPPHQueriesByEducator = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const queries = await OneOnePPH.find({ educator: educatorId })
      .populate('student', 'name email');
    res.status(200).json({ queries });
  } catch (error) {
    console.error('Error fetching PPH queries by educator:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all PPH queries for a student
exports.getPPHQueriesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const queries = await OneOnePPH.find({ student: studentId })
      .populate('educator', 'name email');
    res.status(200).json({ queries });
  } catch (error) {
    console.error('Error fetching PPH queries by student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single PPH query by ID
exports.getPPHQueryById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = await OneOnePPH.findById(id)
      .populate('educator', 'name email')
      .populate('student', 'name email');
    if (!query) {
      return res.status(404).json({ message: 'PPH query not found' });
    }
    res.status(200).json(query);
  } catch (error) {
    console.error('Error fetching PPH query by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
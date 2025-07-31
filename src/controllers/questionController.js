const questionService = require('../services/questionServices');
const { v4: uuidv4 } = require('uuid');

// Store generated questions in memory (in production, use a database)
let generatedQuestions = new Map();

const generateQuestions = async (req, res) => {
  try {
    const {
      jobDescription,
      questionStyles,
      experienceLevel,
      language,
      numberOfQuestions
    } = req.body;

    // Validate required fields
    if (!jobDescription) {
      return res.status(400).json({
        error: 'Job description is required'
      });
    }

    if (!questionStyles || questionStyles.length === 0) {
      return res.status(400).json({
        error: 'At least one question style must be selected'
      });
    }

    if (!experienceLevel) {
      return res.status(400).json({
        error: 'Experience level is required'
      });
    }

    // Validate question styles (exclude the ones mentioned in requirements)
    const allowedStyles = ['Behavioral', 'Situational', 'Technical', 'Knowledge', 'Terminology', 'Problem-Solving'];
    const invalidStyles = questionStyles.filter(style => !allowedStyles.includes(style));
    
    if (invalidStyles.length > 0) {
      return res.status(400).json({
        error: `Invalid question styles: ${invalidStyles.join(', ')}`
      });
    }

    if (questionStyles.length > 3) {
      return res.status(400).json({
        error: 'Maximum 3 question styles can be selected'
      });
    }

    // Validate experience level
    const allowedExperienceLevels = ['Fresher', 'Mid-Level', 'Senior'];
    if (!allowedExperienceLevels.includes(experienceLevel)) {
      return res.status(400).json({
        error: 'Invalid experience level'
      });
    }

    // Generate questions using the service
    const result = await questionService.generateInterviewQuestions({
      jobDescription,
      questionStyles,
      experienceLevel,
      language: language || 'English',
      numberOfQuestions: numberOfQuestions || 5
    });

    // Generate unique IDs for each question and store them
    const questionsWithIds = result.questions.map(question => {
      const questionId = uuidv4();
      const questionWithId = {
        ...question,
        id: questionId
      };
      
      // Store the question with its answer
      generatedQuestions.set(questionId, {
        question: question.question,
        answer: question.expectedAnswer,
        evaluationTips: question.evaluationTips,
        style: question.style
      });
      
      return questionWithId;
    });

    // Return the result without answers (answers will be fetched separately)
    const response = {
      ...result,
      questions: questionsWithIds.map(q => ({
        id: q.id,
        question: q.question,
        style: q.style
      }))
    };

    res.json(response);

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      error: 'Failed to generate questions. Please try again.'
    });
  }
};

const getAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!generatedQuestions.has(questionId)) {
      return res.status(404).json({
        error: 'Question not found'
      });
    }

    const questionData = generatedQuestions.get(questionId);
    
    res.json({
      answer: questionData.answer,
      evaluationTips: questionData.evaluationTips
    });

  } catch (error) {
    console.error('Error fetching answer:', error);
    res.status(500).json({
      error: 'Failed to fetch answer. Please try again.'
    });
  }
};

module.exports = {
  generateQuestions,
  getAnswer
};
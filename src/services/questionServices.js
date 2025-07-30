const aiService = require('./aiService');

const generateInterviewQuestions = async ({
  jobDescription,
  questionStyles,
  experienceLevel,
  language,
  numberOfQuestions
}) => {
  
  // Generate job analysis using AI
  const jobAnalysis = await aiService.analyzeJobDescription(jobDescription, experienceLevel);
  
  // Generate questions using AI based on styles and experience level
  const questions = await aiService.generateQuestionsWithAI({
    jobDescription,
    jobAnalysis,
    questionStyles,
    experienceLevel,
    numberOfQuestions
  });
  
  // Generate interview structure using AI
  const interviewStructure = await aiService.generateInterviewStructure(
    jobAnalysis,
    experienceLevel,
    numberOfQuestions
  );
  
  return {
    jobSummary: {
      jobTitle: jobAnalysis.jobTitle,
      industry: jobAnalysis.industry,
      experienceLevel: experienceLevel
    },
    keySkillsAndCompetencies: {
      personalSkills: jobAnalysis.personalSkills,
      technicalSkills: jobAnalysis.technicalSkills,
      certifications: jobAnalysis.certifications,
      coreCompetencies: jobAnalysis.coreCompetencies,
      totalQuestions: numberOfQuestions
    },
    recommendedInterviewStructure: interviewStructure,
    additionalNotes: jobAnalysis.additionalNotes,
    questions: questions
  };
};

module.exports = {
  generateInterviewQuestions
};
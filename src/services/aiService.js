const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

const callPerplexityAPI = async (prompt) => {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'You are an expert HR and recruitment specialist with deep knowledge of AI and technology roles. Provide detailed, structured, and professional responses.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response from AI";
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to generate AI response');
  }
};

const analyzeJobDescription = async (jobDescription, experienceLevel) => {
  const prompt = `
  Analyze the following job description and extract key information. Return the response in valid JSON format only, no additional text:

  Job Description: "${jobDescription}"
  Experience Level: "${experienceLevel}"

  Please extract and return a JSON object with the following structure:
  {
    "jobTitle": "extracted or inferred job title",
    "industry": "industry sector",
    "personalSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "technicalSkills": ["tech1", "tech2", "tech3", "tech4", "tech5"],
    "certifications": ["cert1", "cert2", "cert3"],
    "coreCompetencies": ["competency1", "competency2", "competency3", "competency4", "competency5"],
    "additionalNotes": ["note1", "note2", "note3", "note4", "note5", "note6"]
  }

  Make sure the skills and competencies are relevant to the job description and experience level provided.
  `;

  try {
    const response = await callPerplexityAPI(prompt);
    
    // Clean the response to extract JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return getDefaultJobAnalysis(experienceLevel);
  } catch (error) {
    console.error('Error analyzing job description:', error);
    return getDefaultJobAnalysis(experienceLevel);
  }
};

const generateQuestionsWithAI = async ({ jobDescription, jobAnalysis, questionStyles, experienceLevel, numberOfQuestions }) => {
  const prompt = `
  Generate ${numberOfQuestions} interview questions for the following job requirements:

  Job Title: ${jobAnalysis.jobTitle}
  Industry: ${jobAnalysis.industry}
  Experience Level: ${experienceLevel}
  Question Styles: ${questionStyles.join(', ')}
  Technical Skills: ${jobAnalysis.technicalSkills.join(', ')}
  Personal Skills: ${jobAnalysis.personalSkills.join(', ')}

  Job Description: "${jobDescription}"

  Please generate questions that match the specified styles: ${questionStyles.join(', ')}.
  
  Question Style Definitions:
  - Technical: Questions about technical knowledge, tools, and implementation
  - Behavioral: Questions about past experiences and behavior patterns  
  - Situational: Hypothetical scenarios and how they would handle them
  - Knowledge: Questions testing theoretical knowledge and concepts
  - Terminology: Questions about definitions and technical terms
  - Problem-Solving: Questions requiring analytical thinking and solution design

  Return the response in valid JSON format only, no additional text:
  {
    "questions": [
      {
        "question": "the interview question text",
        "expectedAnswer": "detailed expected answer explaining what a good response should include",
        "evaluationTips": "tips for the interviewer on what to look for when evaluating the answer",
        "style": "question style from the provided list"
      }
    ]
  }

  Make sure questions are appropriate for ${experienceLevel} level candidates and cover the specified question styles evenly.
  `;

  try {
    const response = await callPerplexityAPI(prompt);
    
    // Clean the response to extract JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return result.questions || [];
    }
    
    // Fallback if JSON parsing fails
    return getDefaultQuestions(questionStyles, experienceLevel, numberOfQuestions);
  } catch (error) {
    console.error('Error generating questions:', error);
    return getDefaultQuestions(questionStyles, experienceLevel, numberOfQuestions);
  }
};

const generateInterviewStructure = async (jobAnalysis, experienceLevel, numberOfQuestions) => {
  const prompt = `
  Create an interview structure for a ${jobAnalysis.jobTitle} position (${experienceLevel} level) with ${numberOfQuestions} questions.
  
  Job Details:
  - Industry: ${jobAnalysis.industry}
  - Technical Skills: ${jobAnalysis.technicalSkills.join(', ')}
  - Core Competencies: ${jobAnalysis.coreCompetencies.join(', ')}

  Return the response in valid JSON format only, no additional text:
  {
    "estimatedDuration": "time estimate like 'Approximately 90 to 120 minutes'",
    "structure": {
      "introduction": "detailed guidance for introduction phase",
      "technicalAssessment": "detailed guidance for technical assessment phase",
      "behavioralAssessment": "detailed guidance for behavioral assessment phase", 
      "closing": "detailed guidance for closing phase"
    }
  }

  Make the structure appropriate for ${experienceLevel} level candidates.
  `;

  try {
    const response = await callPerplexityAPI(prompt);
    
    // Clean the response to extract JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return getDefaultInterviewStructure(experienceLevel, numberOfQuestions);
  } catch (error) {
    console.error('Error generating interview structure:', error);
    return getDefaultInterviewStructure(experienceLevel, numberOfQuestions);
  }
};

// Fallback functions in case AI service fails
const getDefaultJobAnalysis = (experienceLevel) => {
  return {
    jobTitle: "AI Specialist",
    industry: "Technology / AI Solutions",
    personalSkills: [
      "Machine Learning", "Natural Language Processing", "Computer Vision", 
      "Ethical AI", "Data Privacy"
    ],
    technicalSkills: [
      "AI Model Development", "Bias Mitigation", "Model Tuning", 
      "Data Preprocessing", "Regulatory Compliance"
    ],
    certifications: [
      "Certified AI Practitioner", "Data Science Certification", "Ethical AI Training"
    ],
    coreCompetencies: [
      "Technical Expertise", "Problem Solving", "Ethical Awareness", 
      "Communication", "Collaboration"
    ],
    additionalNotes: [
      "Focus on candidate's grasp of AI fundamentals and ethical considerations.",
      "Watch for clear communication and structured problem-solving.",
      "Be alert to vague answers or inability to provide examples.",
      "Maintain a balanced tone to keep stress moderate but insightful.",
      "Use note-taking to capture key candidate strengths and concerns.",
      "Evaluate how candidates align with company values and AI responsibility."
    ]
  };
};

const getDefaultQuestions = (questionStyles, experienceLevel, numberOfQuestions) => {
  const defaultQuestions = [
    {
      question: "Can you explain how machine learning differs from traditional programming and provide an example of its application in healthcare or finance?",
      expectedAnswer: "The candidate should explain that traditional programming follows explicit instructions coded by developers, whereas machine learning allows models to learn patterns from data and improve over time. An example in healthcare could be AI-driven diagnostics identifying diseases from imaging data, and in finance, algorithms predicting market trends.",
      evaluationTips: "Look for clear differentiation between ML and traditional programming, and relevant practical examples. Assess if the candidate understands the core concept and real-world impact.",
      style: "Technical"
    }
  ];

  return defaultQuestions.slice(0, numberOfQuestions);
};

const getDefaultInterviewStructure = (experienceLevel, numberOfQuestions) => {
  const baseDuration = numberOfQuestions * 15;
  const totalDuration = Math.max(60, Math.min(120, baseDuration));
  
  return {
    estimatedDuration: `Approximately ${Math.floor(totalDuration / 60)} to ${Math.ceil(totalDuration / 60)} hours`,
    structure: {
      introduction: "Begin by welcoming the candidate and providing a brief overview of the company and its AI initiatives. Explain the role's expectations in terms of technical expertise and ethical responsibility. Outline the interview format and estimated timing to set clear expectations.",
      technicalAssessment: "Start with foundational AI concepts such as machine learning principles and differences from traditional programming. Progress to discussing practical applications and challenges in NLP and computer vision. Incorporate problem-solving questions about model performance and bias mitigation to evaluate applied knowledge.",
      behavioralAssessment: "Assess communication clarity as candidates explain complex AI concepts. Explore teamwork experiences, adaptability to evolving AI technologies, and ethical decision-making approaches. Use open-ended questions to gauge cultural fit and collaboration skills.",
      closing: "Invite the candidate's questions to clarify any role or company aspects. Explain next steps in the hiring process and provide a timeline for feedback. Thank the candidate for their time and maintain a professional, positive tone to end the interview."
    }
  };
};

module.exports = {
  analyzeJobDescription,
  generateQuestionsWithAI,
  generateInterviewStructure
};
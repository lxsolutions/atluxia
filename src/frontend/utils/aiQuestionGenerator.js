

import axios from 'axios';  // Add to package.json if needed: npm install axios

// Environment variables for AI APIs
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';  // xAI Grok API endpoint
const GROK_API_KEY = process.env.REACT_APP_GROK_API_KEY;      // Set in .env
const FALLBACK_API_URL = 'https://api.example.com/fallback';   // Fallback AI service

// Supported subjects and their respective models
const SUBJECT_MODELS = {
  math: 'grok-math-v2',
  science: 'grok-science-v1',
  history: 'grok-history-v3',
  language: 'grok-language-v4'
};

export async function generateDynamicQuestion(subject, grade, difficulty) {
  if (!GROK_API_KEY) {
    console.warn('Grok API key missing; falling back to static questions');
    return null;  // Or return static fallback
  }

  try {
    const model = SUBJECT_MODELS[subject] || 'grok-beta';
    const response = await axios.post(GROK_API_URL, {
      model: model,
      messages: [{
        role: 'user',
        content: `Generate a ${difficulty}-level educational question for grade ${grade} in ${subject}. Format: { "question": "...", "options": ["A", "B", "C", "D"], "answer": "A" }`
      }]
    }, {
      headers: { Authorization: `Bearer ${GROK_API_KEY}` }
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('AI question generation failed:', error);

    // Fallback to simpler AI or static questions
    try {
      const fallbackResponse = await axios.post(FALLBACK_API_URL, {
        subject: subject,
        grade: grade,
        difficulty: difficulty
      });
      return JSON.parse(fallbackResponse.data.question);
    } catch (fallbackError) {
      console.error('Fallback question generation failed:', fallbackError);
      return null;  // Return static questions as final fallback
    }
  }
}


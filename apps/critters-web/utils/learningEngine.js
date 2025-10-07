


import mathQuestions from '../../../data/questions/math.json';
import scienceQuestions from '../../../data/questions/science.json';

const learningEngine = {
  // Load all educational content
  questions: {
    math: mathQuestions,
    science: scienceQuestions
  },

  // Get a random question by subject and difficulty
  getRandomQuestion(subject, difficulty) {
    const questions = this.questions[subject];
    if (!questions) return null;

    // Filter by difficulty if specified
    let filteredQuestions = questions;
    if (difficulty) {
      filteredQuestions = questions.filter(q => q.difficulty === difficulty);
    }

    if (filteredQuestions.length === 0) return null;

    // Return a random question
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    return filteredQuestions[randomIndex];
  },

  // Get questions by grade level and subject
  getQuestionsByGrade(gradeLevel, subject) {
    const questions = this.questions[subject];
    if (!questions) return [];

    return questions.filter(q => q.gradeLevel.includes(gradeLevel));
  },

  // Generate a math problem dynamically
  generateMathProblem() {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2;

    switch(operator) {
      case '+':
        num1 = Math.floor(Math.random() * 50);
        num2 = Math.floor(Math.random() * 50);
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50);
        num2 = Math.floor(Math.random() * num1); // Ensure num2 <= num1
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10);
        num2 = Math.floor(Math.random() * 10);
        break;
    }

    let correctAnswer;
    switch(operator) {
      case '+': correctAnswer = num1 + num2; break;
      case '-': correctAnswer = num1 - num2; break;
      case '*': correctAnswer = num1 * num2; break;
    }
    const wrongAnswers = [];

    // Generate wrong answers
    for (let i = 0; i < 3; i++) {
      let wrongAnswer;
      do {
        if (operator === '+') wrongAnswer = num1 + Math.floor(Math.random() * 20) - 10; // Range around correct answer
        else if (operator === '-') wrongAnswer = num1 - Math.floor(Math.random() * 20);
        else wrongAnswer = num1 * Math.floor(Math.random() * 3); // Keep multiplication simpler
      } while (wrongAnswer === correctAnswer || wrongAnswer < 0);

      wrongAnswers.push(wrongAnswer);
    }

    // Shuffle answers
    const allAnswers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const correctIndex = allAnswers.indexOf(correctAnswer);

    return {
      question: `${num1} ${operator} ${num2} = ?`,
      answers: allAnswers,
      correct: correctIndex
    };
  },

  // Generate a science fact question
  generateScienceFact() {
    const facts = [
      { question: "What is the largest planet in our solar system?", answers: ["Jupiter", "Earth", "Mars", "Saturn"], correct: 0 },
      { question: "Which gas do plants absorb during photosynthesis?", answers: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correct: 1 },
      { question: "What is the boiling point of water at sea level?", answers: ["100°C", "95°C", "105°C", "90°C"], correct: 0 },
      { question: "Which element has the atomic number 1?", answers: ["Hydrogen", "Helium", "Oxygen", "Carbon"], correct: 0 }
    ];

    const randomIndex = Math.floor(Math.random() * facts.length);
    return facts[randomIndex];
  },

  // Adaptive difficulty adjustment based on performance
  adjustDifficulty(performance) {
    // Simple heuristic: if >70% correct, increase difficulty; if <30%, decrease
    if (performance > 0.7) return 'hard';
    else if (performance > 0.3) return 'medium';
    else return 'easy';
  }
};

export default learningEngine;



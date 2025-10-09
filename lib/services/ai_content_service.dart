import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/user.dart';
import '../models/mini_game.dart';
import '../models/learning_content.dart';
import '../models/curriculum.dart';
import '../models/assessment.dart';

class AIContentService {
  static const String _baseUrl = 'https://api.openai.com/v1';
  late final String _apiKey;
  late final String _model;

  AIContentService() {
    _apiKey = dotenv.env['OPENAI_API_KEY'] ?? '';
    _model = dotenv.env['OPENAI_MODEL'] ?? 'gpt-3.5-turbo';
  }

  Future<List<GameQuestion>> generateQuestions({
    required GameType gameType,
    required GameDifficulty difficulty,
    required User user,
    int questionCount = 5,
  }) async {
    try {
      final prompt = _buildQuestionPrompt(
        gameType: gameType,
        difficulty: difficulty,
        user: user,
        questionCount: questionCount,
      );

      final response = await _makeOpenAIRequest(prompt);
      return _parseQuestionsFromResponse(response);
    } catch (e) {
      print('Error generating questions: $e');
      return _getFallbackQuestions(gameType, difficulty, user.age);
    }
  }

  Future<LearningContent> generatePersonalizedContent({
    required User user,
    required String subject,
    String? specificTopic,
  }) async {
    try {
      final prompt = _buildContentPrompt(
        user: user,
        subject: subject,
        specificTopic: specificTopic,
      );

      final response = await _makeOpenAIRequest(prompt);
      return _parseContentFromResponse(response, subject);
    } catch (e) {
      print('Error generating content: $e');
      return _getFallbackContent(subject, user.age);
    }
  }

  Future<List<String>> generateEncouragement({
    required User user,
    required GameSession session,
  }) async {
    try {
      final prompt = _buildEncouragementPrompt(user: user, session: session);
      final response = await _makeOpenAIRequest(prompt);
      return _parseEncouragementFromResponse(response);
    } catch (e) {
      print('Error generating encouragement: $e');
      return _getFallbackEncouragement(session.accuracyPercentage);
    }
  }

  // Comprehensive Lesson Generation
  Future<Lesson?> generateLesson({
    required Subject subject,
    required GradeLevel gradeLevel,
    required String standardId,
    required User user,
    int? targetMinutes,
  }) async {
    try {
      final prompt = _buildLessonPrompt(
        subject: subject,
        gradeLevel: gradeLevel,
        standardId: standardId,
        user: user,
        targetMinutes: targetMinutes ?? 30,
      );

      final response = await _makeOpenAIRequest(prompt);
      return _parseLessonFromResponse(response, subject, gradeLevel);
    } catch (e) {
      print('Error generating lesson: $e');
      return _getFallbackLesson(subject, gradeLevel, user.age);
    }
  }

  // Comprehensive Assessment Generation
  Future<Assessment?> generateAssessment({
    required Subject subject,
    required GradeLevel gradeLevel,
    required List<String> standardIds,
    required User user,
    required AssessmentType assessmentType,
    int? questionCount,
  }) async {
    try {
      final prompt = _buildAssessmentPrompt(
        subject: subject,
        gradeLevel: gradeLevel,
        standardIds: standardIds,
        user: user,
        assessmentType: assessmentType,
        questionCount: questionCount ?? 10,
      );

      final response = await _makeOpenAIRequest(prompt);
      return _parseAssessmentFromResponse(response, subject, gradeLevel, standardIds, assessmentType);
    } catch (e) {
      print('Error generating assessment: $e');
      return _getFallbackAssessment(subject, gradeLevel, assessmentType);
    }
  }

  // Weekly Learning Report Generation
  Future<Map<String, dynamic>?> generateWeeklyReport({
    required User user,
    required DateTime weekStart,
    required Map<String, dynamic> progressData,
  }) async {
    try {
      final prompt = _buildWeeklyReportPrompt(
        user: user,
        weekStart: weekStart,
        progressData: progressData,
      );

      final response = await _makeOpenAIRequest(prompt);
      return _parseWeeklyReportFromResponse(response);
    } catch (e) {
      print('Error generating weekly report: $e');
      return null;
    }
  }

  String _buildQuestionPrompt({
    required GameType gameType,
    required GameDifficulty difficulty,
    required User user,
    required int questionCount,
  }) {
    final ageDescription = _getAgeDescription(user.age);
    final difficultyDescription = _getDifficultyDescription(difficulty);
    final subjectFocus = _getSubjectFocus(gameType, user.preferences.favoriteSubjects);

    return '''
Generate $questionCount educational questions for a ${user.age}-year-old child ($ageDescription) for a ${gameType.name} mini-game.

Requirements:
- Difficulty: $difficultyDescription
- Age-appropriate language and concepts
- Multiple choice with 3-4 options each
- Include correct answer and brief explanation
- Make it fun and engaging
- Focus on: $subjectFocus
- Gender-inclusive content
- Positive, encouraging tone

Format as JSON array with this structure:
[
  {
    "question": "What is 2 + 3?",
    "options": ["4", "5", "6", "7"],
    "correctAnswer": "5",
    "explanation": "When we add 2 and 3 together, we get 5!"
  }
]

Subject: ${gameType.name}
Child's interests: ${user.preferences.favoriteSubjects.join(', ')}
Learning style: ${user.preferences.learningStyle.name}
''';
  }

  String _buildContentPrompt({
    required User user,
    required String subject,
    String? specificTopic,
  }) {
    final topicFocus = specificTopic != null ? 'focusing on $specificTopic' : '';
    
    return '''
Create personalized learning content for a ${user.age}-year-old child in $subject $topicFocus.

Child profile:
- Age: ${user.age} years
- Learning style: ${user.preferences.learningStyle.name}
- Interests: ${user.preferences.favoriteSubjects.join(', ')}
- Current level: ${user.progress.subjectLevels[subject] ?? 1}

Requirements:
- Age-appropriate and engaging
- Interactive elements
- Clear learning objectives
- Fun facts or interesting connections
- Positive reinforcement
- Gender-inclusive
- Safe content for children

Format as JSON with:
{
  "title": "Content title",
  "description": "Brief description",
  "content": "Main learning content",
  "activities": ["activity1", "activity2"],
  "funFacts": ["fact1", "fact2"],
  "learningObjectives": ["objective1", "objective2"]
}
''';
  }

  String _buildEncouragementPrompt({
    required User user,
    required GameSession session,
  }) {
    final performance = session.accuracyPercentage >= 80 ? 'excellent' : 
                      session.accuracyPercentage >= 60 ? 'good' : 'needs improvement';
    
    return '''
Generate 3 encouraging messages for a ${user.age}-year-old child who just completed a learning game.

Performance: $performance (${session.accuracyPercentage.toStringAsFixed(1)}% accuracy)
Game type: ${session.gameId}
Time spent: ${session.totalTimeSpent} seconds

Requirements:
- Age-appropriate language
- Positive and encouraging
- Specific to their performance
- Motivating for continued learning
- Gender-neutral
- Focus on effort and growth

Format as JSON array: ["message1", "message2", "message3"]
''';
  }

  String _buildLessonPrompt({
    required Subject subject,
    required GradeLevel gradeLevel,
    required String standardId,
    required User user,
    required int targetMinutes,
  }) {
    return '''
Create a comprehensive ${targetMinutes}-minute lesson for a ${user.age}-year-old child in ${subject.name} at ${gradeLevel.name} level.

Child Profile:
- Age: ${user.age}
- Grade Level: ${gradeLevel.name}
- Learning Style: ${user.preferences.learningStyle.name}
- Interests: ${user.preferences.favoriteSubjects.join(', ')}

Lesson Requirements:
- Aligned to learning standard: $standardId
- Duration: $targetMinutes minutes
- Age-appropriate and engaging
- Include multiple learning activities
- Clear learning objectives
- Assessment opportunities
- Materials list
- Step-by-step instructions
- Differentiation for different learning styles
- Connection to real-world applications

Format as JSON:
{
  "title": "Lesson title",
  "description": "Brief description",
  "content": "Main lesson content with detailed instructions",
  "activities": [
    {
      "title": "Activity name",
      "description": "Activity description",
      "type": "practice|game|discussion|creative",
      "instructions": "Step-by-step instructions",
      "estimatedMinutes": 10,
      "isRequired": true
    }
  ],
  "materials": {
    "required": ["item1", "item2"],
    "optional": ["item3"]
  },
  "learningObjectives": ["objective1", "objective2"],
  "assessmentCriteria": {
    "mastery": "What mastery looks like",
    "developing": "What developing looks like"
  }
}
''';
  }

  String _buildAssessmentPrompt({
    required Subject subject,
    required GradeLevel gradeLevel,
    required List<String> standardIds,
    required User user,
    required AssessmentType assessmentType,
    required int questionCount,
  }) {
    return '''
Create a ${assessmentType.name} assessment for a ${user.age}-year-old child in ${subject.name} at ${gradeLevel.name} level.

Assessment Details:
- Type: ${assessmentType.name}
- Subject: ${subject.name}
- Grade Level: ${gradeLevel.name}
- Standards: ${standardIds.join(', ')}
- Question Count: $questionCount
- Child Age: ${user.age}

Requirements:
- Age-appropriate language and concepts
- Variety of question types (multiple choice, true/false, short answer)
- Clear, unambiguous questions
- Appropriate difficulty level
- Engaging and relevant contexts
- Immediate feedback explanations
- Aligned to specified learning standards

Format as JSON:
{
  "title": "Assessment title",
  "description": "Assessment description",
  "questions": [
    {
      "question": "Question text",
      "type": "multipleChoice|trueFalse|shortAnswer|fillInBlank",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswers": ["correct answer"],
      "explanation": "Why this is correct",
      "points": 1
    }
  ],
  "passingScore": 80,
  "timeLimit": 20
}
''';
  }

  String _buildWeeklyReportPrompt({
    required User user,
    required DateTime weekStart,
    required Map<String, dynamic> progressData,
  }) {
    return '''
Generate a comprehensive weekly learning report for ${user.name}, age ${user.age}, for the week of ${weekStart.toString().split(' ')[0]}.

Progress Data:
${progressData.toString()}

Report Requirements:
- Professional tone suitable for parents/guardians
- Highlight achievements and progress
- Identify areas for improvement
- Specific examples and data
- Actionable recommendations
- Celebration of effort and growth
- Age-appropriate learning goals for next week
- Compliance with homeschool documentation requirements

Format as JSON:
{
  "summary": "Overall week summary",
  "achievements": ["achievement1", "achievement2"],
  "subjectProgress": {
    "math": {
      "timeSpent": 150,
      "lessonsCompleted": 5,
      "assessmentScores": [85, 92],
      "strengths": ["strength1"],
      "improvements": ["area1"]
    }
  },
  "recommendations": ["recommendation1", "recommendation2"],
  "nextWeekGoals": ["goal1", "goal2"],
  "parentNotes": "Additional notes for parents"
}
''';
  }

  Future<String> _makeOpenAIRequest(String prompt) async {
    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $_apiKey',
    };

    final body = jsonEncode({
      'model': _model,
      'messages': [
        {
          'role': 'system',
          'content': 'You are a helpful educational AI assistant that creates age-appropriate, engaging learning content for children aged 4-9. Always respond with valid JSON format.'
        },
        {
          'role': 'user',
          'content': prompt,
        }
      ],
      'max_tokens': 1500,
      'temperature': 0.7,
    });

    final response = await http.post(
      Uri.parse('$_baseUrl/chat/completions'),
      headers: headers,
      body: body,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['choices'][0]['message']['content'];
    } else {
      throw Exception('OpenAI API error: ${response.statusCode} - ${response.body}');
    }
  }

  List<GameQuestion> _parseQuestionsFromResponse(String response) {
    try {
      // Clean the response to extract JSON
      final jsonStart = response.indexOf('[');
      final jsonEnd = response.lastIndexOf(']') + 1;
      final jsonString = response.substring(jsonStart, jsonEnd);
      
      final List<dynamic> questionsJson = jsonDecode(jsonString);
      
      return questionsJson.map((q) => GameQuestion(
        id: DateTime.now().millisecondsSinceEpoch.toString() + 
             questionsJson.indexOf(q).toString(),
        question: q['question'],
        options: List<String>.from(q['options']),
        correctAnswer: q['correctAnswer'],
        explanation: q['explanation'],
      )).toList();
    } catch (e) {
      print('Error parsing questions: $e');
      return [];
    }
  }

  LearningContent _parseContentFromResponse(String response, String subject) {
    try {
      final jsonStart = response.indexOf('{');
      final jsonEnd = response.lastIndexOf('}') + 1;
      final jsonString = response.substring(jsonStart, jsonEnd);
      
      final Map<String, dynamic> contentJson = jsonDecode(jsonString);
      
      return LearningContent.fromJson({
        ...contentJson,
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'subject': subject,
        'createdAt': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      print('Error parsing content: $e');
      return _getFallbackContent(subject, 5);
    }
  }

  List<String> _parseEncouragementFromResponse(String response) {
    try {
      final jsonStart = response.indexOf('[');
      final jsonEnd = response.lastIndexOf(']') + 1;
      final jsonString = response.substring(jsonStart, jsonEnd);
      
      final List<dynamic> messages = jsonDecode(jsonString);
      return messages.cast<String>();
    } catch (e) {
      print('Error parsing encouragement: $e');
      return [];
    }
  }

  Lesson? _parseLessonFromResponse(String response, Subject subject, GradeLevel gradeLevel) {
    try {
      final jsonStart = response.indexOf('{');
      final jsonEnd = response.lastIndexOf('}') + 1;
      final jsonString = response.substring(jsonStart, jsonEnd);
      
      final Map<String, dynamic> lessonJson = jsonDecode(jsonString);
      
      // Parse activities
      final activitiesJson = lessonJson['activities'] as List? ?? [];
      final activities = activitiesJson.map((a) => LessonActivity(
        id: DateTime.now().millisecondsSinceEpoch.toString() + activitiesJson.indexOf(a).toString(),
        title: a['title'] ?? 'Activity',
        description: a['description'] ?? '',
        type: a['type'] ?? 'practice',
        instructions: a['instructions'] ?? '',
        configuration: {},
        estimatedMinutes: a['estimatedMinutes'] ?? 10,
        isRequired: a['isRequired'] ?? true,
      )).toList();

      return Lesson.create(
        title: lessonJson['title'] ?? 'AI Generated Lesson',
        description: lessonJson['description'] ?? '',
        subject: subject,
        gradeLevel: gradeLevel,
        objectiveIds: List<String>.from(lessonJson['learningObjectives'] ?? []),
        content: lessonJson['content'] ?? '',
        activities: activities,
        estimatedMinutes: activities.fold<int>(0, (sum, a) => sum + a.estimatedMinutes),
        isAIGenerated: true,
      );
    } catch (e) {
      print('Error parsing lesson: $e');
      return null;
    }
  }

  Assessment? _parseAssessmentFromResponse(
    String response,
    Subject subject,
    GradeLevel gradeLevel,
    List<String> standardIds,
    AssessmentType assessmentType,
  ) {
    try {
      final jsonStart = response.indexOf('{');
      final jsonEnd = response.lastIndexOf('}') + 1;
      final jsonString = response.substring(jsonStart, jsonEnd);
      
      final Map<String, dynamic> assessmentJson = jsonDecode(jsonString);
      
      // Parse questions
      final questionsJson = assessmentJson['questions'] as List? ?? [];
      final questions = questionsJson.map((q) {
        final questionType = QuestionType.values.firstWhere(
          (type) => type.name == q['type'],
          orElse: () => QuestionType.multipleChoice,
        );
        
        return AssessmentQuestion(
          id: DateTime.now().millisecondsSinceEpoch.toString() + questionsJson.indexOf(q).toString(),
          question: q['question'] ?? '',
          type: questionType,
          options: List<String>.from(q['options'] ?? []),
          correctAnswers: List<String>.from(q['correctAnswers'] ?? []),
          explanation: q['explanation'] ?? '',
          points: q['points'] ?? 1,
          configuration: {},
          standardIds: standardIds,
        );
      }).toList();

      return Assessment.create(
        title: assessmentJson['title'] ?? 'AI Generated Assessment',
        description: assessmentJson['description'] ?? '',
        type: assessmentType,
        subject: subject,
        gradeLevel: gradeLevel,
        standardIds: standardIds,
        questions: questions,
        timeLimit: assessmentJson['timeLimit'] ?? 0,
        isAIGenerated: true,
      );
    } catch (e) {
      print('Error parsing assessment: $e');
      return null;
    }
  }

  Map<String, dynamic>? _parseWeeklyReportFromResponse(String response) {
    try {
      final jsonStart = response.indexOf('{');
      final jsonEnd = response.lastIndexOf('}') + 1;
      final jsonString = response.substring(jsonStart, jsonEnd);
      
      return jsonDecode(jsonString) as Map<String, dynamic>;
    } catch (e) {
      print('Error parsing weekly report: $e');
      return null;
    }
  }

  // Helper methods
  String _getAgeDescription(int age) {
    if (age <= 5) return 'preschooler';
    if (age <= 6) return 'kindergartener';
    if (age <= 7) return 'early elementary student';
    return 'elementary student';
  }

  String _getDifficultyDescription(GameDifficulty difficulty) {
    switch (difficulty) {
      case GameDifficulty.easy:
        return 'Very simple, basic concepts';
      case GameDifficulty.medium:
        return 'Moderate difficulty, building on basics';
      case GameDifficulty.hard:
        return 'Challenging but age-appropriate';
      case GameDifficulty.expert:
        return 'Advanced for the age group';
    }
  }

  String _getSubjectFocus(GameType gameType, List<String> interests) {
    final focus = <String>[];
    
    switch (gameType) {
      case GameType.math:
        focus.addAll(['counting', 'basic arithmetic', 'shapes', 'patterns']);
        break;
      case GameType.reading:
        focus.addAll(['letters', 'phonics', 'simple words', 'reading comprehension']);
        break;
      case GameType.science:
        focus.addAll(['nature', 'animals', 'weather', 'simple experiments']);
        break;
      case GameType.art:
        focus.addAll(['colors', 'creativity', 'drawing', 'crafts']);
        break;
      case GameType.memory:
        focus.addAll(['visual memory', 'pattern recognition', 'sequences']);
        break;
      case GameType.puzzle:
        focus.addAll(['problem solving', 'logic', 'spatial reasoning']);
        break;
    }
    
    return focus.join(', ');
  }

  // Fallback methods for when AI service is unavailable
  List<GameQuestion> _getFallbackQuestions(GameType gameType, GameDifficulty difficulty, int age) {
    // Return pre-made questions based on game type and difficulty
    switch (gameType) {
      case GameType.math:
        return _getMathFallbackQuestions(age);
      case GameType.reading:
        return _getReadingFallbackQuestions(age);
      default:
        return _getGenericFallbackQuestions();
    }
  }

  List<GameQuestion> _getMathFallbackQuestions(int age) {
    if (age <= 5) {
      return [
        const GameQuestion(
          id: 'math_1',
          question: 'How many fingers do you have on one hand?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '5',
          explanation: 'We have 5 fingers on each hand!',
        ),
        const GameQuestion(
          id: 'math_2',
          question: 'What comes after 2?',
          options: ['1', '3', '4', '5'],
          correctAnswer: '3',
          explanation: 'After 2 comes 3!',
        ),
      ];
    }
    return [
      const GameQuestion(
        id: 'math_3',
        question: 'What is 3 + 2?',
        options: ['4', '5', '6', '7'],
        correctAnswer: '5',
        explanation: 'When we add 3 and 2, we get 5!',
      ),
    ];
  }

  List<GameQuestion> _getReadingFallbackQuestions(int age) {
    return [
      const GameQuestion(
        id: 'reading_1',
        question: 'What sound does the letter "A" make?',
        options: ['Ah', 'Eh', 'Oh', 'Uh'],
        correctAnswer: 'Ah',
        explanation: 'The letter A makes the "Ah" sound!',
      ),
    ];
  }

  List<GameQuestion> _getGenericFallbackQuestions() {
    return [
      const GameQuestion(
        id: 'generic_1',
        question: 'What color do you get when you mix red and blue?',
        options: ['Green', 'Purple', 'Yellow', 'Orange'],
        correctAnswer: 'Purple',
        explanation: 'Red and blue make purple!',
      ),
    ];
  }

  LearningContent _getFallbackContent(String subject, int age) {
    return LearningContent(
      id: 'fallback_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Learning $subject',
      description: 'Fun activities to learn about $subject',
      subject: subject,
      content: 'Let\'s explore $subject together!',
      activities: ['Practice exercises', 'Fun games'],
      funFacts: ['$subject is everywhere around us!'],
      learningObjectives: ['Understand basic $subject concepts'],
      targetAge: age,
      createdAt: DateTime.now(),
    );
  }

  List<String> _getFallbackEncouragement(double accuracy) {
    if (accuracy >= 80) {
      return [
        'Amazing work! You\'re doing great!',
        'Fantastic! Keep up the excellent learning!',
        'You\'re a superstar learner!',
      ];
    } else if (accuracy >= 60) {
      return [
        'Good job! You\'re learning so much!',
        'Nice work! Keep practicing!',
        'You\'re getting better every day!',
      ];
    } else {
      return [
        'Great effort! Learning takes practice!',
        'You\'re trying your best, and that\'s wonderful!',
        'Keep going! Every try makes you stronger!',
      ];
    }
  }

  Lesson _getFallbackLesson(Subject subject, GradeLevel gradeLevel, int age) {
    return Lesson.create(
      title: 'Learning ${_getSubjectDisplayName(subject)}',
      description: 'A fun lesson to learn about ${_getSubjectDisplayName(subject)}',
      subject: subject,
      gradeLevel: gradeLevel,
      objectiveIds: [],
      content: 'Let\'s explore ${_getSubjectDisplayName(subject)} together! This is a basic lesson to get you started.',
      activities: [
        LessonActivity(
          id: 'fallback_activity_1',
          title: 'Practice Activity',
          description: 'Practice what you\'ve learned',
          type: 'practice',
          instructions: 'Follow along and practice the concepts',
          configuration: {},
          estimatedMinutes: 15,
          isRequired: true,
        ),
      ],
      estimatedMinutes: 20,
      isAIGenerated: false,
    );
  }

  Assessment _getFallbackAssessment(Subject subject, GradeLevel gradeLevel, AssessmentType type) {
    final questions = [
      AssessmentQuestion(
        id: 'fallback_q1',
        question: 'This is a sample question for ${_getSubjectDisplayName(subject)}',
        type: QuestionType.multipleChoice,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswers: ['Option A'],
        explanation: 'This is the correct answer because...',
        points: 1,
        configuration: {},
        standardIds: [],
      ),
    ];

    return Assessment.create(
      title: '${_getSubjectDisplayName(subject)} Assessment',
      description: 'A basic assessment for ${_getSubjectDisplayName(subject)}',
      type: type,
      subject: subject,
      gradeLevel: gradeLevel,
      standardIds: [],
      questions: questions,
      isAIGenerated: false,
    );
  }

  String _getSubjectDisplayName(Subject subject) {
    switch (subject) {
      case Subject.math:
        return 'Math';
      case Subject.reading:
        return 'Reading';
      case Subject.writing:
        return 'Writing';
      case Subject.science:
        return 'Science';
      case Subject.art:
        return 'Art';
      case Subject.socialStudies:
        return 'Social Studies';
    }
  }
}
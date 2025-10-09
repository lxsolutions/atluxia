import 'package:uuid/uuid.dart';
import 'curriculum.dart';

enum AssessmentType {
  diagnostic, // Initial placement
  formative, // Ongoing progress checks
  summative, // End of unit/standard
  mastery, // Competency verification
  portfolio, // Collection of work
}

enum QuestionType {
  multipleChoice,
  trueFalse,
  shortAnswer,
  essay,
  matching,
  ordering,
  fillInBlank,
  drawing,
  recording, // Audio/video response
}

class AssessmentQuestion {
  final String id;
  final String question;
  final QuestionType type;
  final List<String> options; // For multiple choice, matching, etc.
  final List<String> correctAnswers; // Can have multiple correct answers
  final String explanation;
  final int points;
  final String? imageUrl;
  final String? audioUrl;
  final Map<String, dynamic> configuration; // Type-specific settings
  final List<String> standardIds; // Standards this question assesses

  const AssessmentQuestion({
    required this.id,
    required this.question,
    required this.type,
    required this.options,
    required this.correctAnswers,
    required this.explanation,
    required this.points,
    this.imageUrl,
    this.audioUrl,
    required this.configuration,
    required this.standardIds,
  });

  bool isCorrect(List<String> userAnswers) {
    if (correctAnswers.isEmpty) return false;
    
    switch (type) {
      case QuestionType.multipleChoice:
      case QuestionType.trueFalse:
      case QuestionType.fillInBlank:
        return userAnswers.length == 1 && 
               correctAnswers.contains(userAnswers.first.toLowerCase().trim());
      
      case QuestionType.matching:
      case QuestionType.ordering:
        return userAnswers.length == correctAnswers.length &&
               _listsEqual(userAnswers, correctAnswers);
      
      case QuestionType.shortAnswer:
        return userAnswers.isNotEmpty && 
               _isShortAnswerCorrect(userAnswers.first, correctAnswers);
      
      case QuestionType.essay:
      case QuestionType.drawing:
      case QuestionType.recording:
        // These require manual grading or AI evaluation
        return false;
    }
  }

  bool _listsEqual(List<String> a, List<String> b) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i].toLowerCase().trim() != b[i].toLowerCase().trim()) return false;
    }
    return true;
  }

  bool _isShortAnswerCorrect(String userAnswer, List<String> correctAnswers) {
    final cleanAnswer = userAnswer.toLowerCase().trim();
    return correctAnswers.any((correct) => 
        cleanAnswer.contains(correct.toLowerCase().trim()) ||
        correct.toLowerCase().trim().contains(cleanAnswer));
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'question': question,
      'type': type.name,
      'options': options,
      'correctAnswers': correctAnswers,
      'explanation': explanation,
      'points': points,
      'imageUrl': imageUrl,
      'audioUrl': audioUrl,
      'configuration': configuration,
      'standardIds': standardIds,
    };
  }

  factory AssessmentQuestion.fromJson(Map<String, dynamic> json) {
    return AssessmentQuestion(
      id: json['id'],
      question: json['question'],
      type: QuestionType.values.firstWhere((e) => e.name == json['type']),
      options: List<String>.from(json['options'] ?? []),
      correctAnswers: List<String>.from(json['correctAnswers'] ?? []),
      explanation: json['explanation'] ?? '',
      points: json['points'] ?? 1,
      imageUrl: json['imageUrl'],
      audioUrl: json['audioUrl'],
      configuration: Map<String, dynamic>.from(json['configuration'] ?? {}),
      standardIds: List<String>.from(json['standardIds'] ?? []),
    );
  }
}

class Assessment {
  final String id;
  final String title;
  final String description;
  final AssessmentType type;
  final Subject subject;
  final GradeLevel gradeLevel;
  final List<String> standardIds;
  final List<AssessmentQuestion> questions;
  final int totalPoints;
  final int passingScore; // Minimum points for mastery
  final int timeLimit; // Minutes (0 = no limit)
  final bool allowRetakes;
  final int maxAttempts;
  final DateTime createdAt;
  final bool isAIGenerated;
  final Map<String, dynamic> metadata;

  const Assessment({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.subject,
    required this.gradeLevel,
    required this.standardIds,
    required this.questions,
    required this.totalPoints,
    required this.passingScore,
    required this.timeLimit,
    required this.allowRetakes,
    required this.maxAttempts,
    required this.createdAt,
    required this.isAIGenerated,
    required this.metadata,
  });

  factory Assessment.create({
    required String title,
    required String description,
    required AssessmentType type,
    required Subject subject,
    required GradeLevel gradeLevel,
    required List<String> standardIds,
    List<AssessmentQuestion>? questions,
    int? timeLimit,
    bool allowRetakes = true,
    int maxAttempts = 3,
    bool isAIGenerated = false,
  }) {
    final uuid = const Uuid();
    final questionList = questions ?? [];
    final totalPoints = questionList.fold<int>(0, (sum, q) => sum + q.points);
    final passingScore = (totalPoints * 0.8).round(); // 80% for mastery
    
    return Assessment(
      id: uuid.v4(),
      title: title,
      description: description,
      type: type,
      subject: subject,
      gradeLevel: gradeLevel,
      standardIds: standardIds,
      questions: questionList,
      totalPoints: totalPoints,
      passingScore: passingScore,
      timeLimit: timeLimit ?? 0,
      allowRetakes: allowRetakes,
      maxAttempts: maxAttempts,
      createdAt: DateTime.now(),
      isAIGenerated: isAIGenerated,
      metadata: {},
    );
  }

  double getPassingPercentage() {
    return totalPoints > 0 ? (passingScore / totalPoints) * 100 : 0;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type.name,
      'subject': subject.name,
      'gradeLevel': gradeLevel.name,
      'standardIds': standardIds,
      'questions': questions.map((q) => q.toJson()).toList(),
      'totalPoints': totalPoints,
      'passingScore': passingScore,
      'timeLimit': timeLimit,
      'allowRetakes': allowRetakes,
      'maxAttempts': maxAttempts,
      'createdAt': createdAt.toIso8601String(),
      'isAIGenerated': isAIGenerated,
      'metadata': metadata,
    };
  }

  factory Assessment.fromJson(Map<String, dynamic> json) {
    return Assessment(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      type: AssessmentType.values.firstWhere((e) => e.name == json['type']),
      subject: Subject.values.firstWhere((e) => e.name == json['subject']),
      gradeLevel: GradeLevel.values.firstWhere((e) => e.name == json['gradeLevel']),
      standardIds: List<String>.from(json['standardIds'] ?? []),
      questions: (json['questions'] as List? ?? [])
          .map((q) => AssessmentQuestion.fromJson(q))
          .toList(),
      totalPoints: json['totalPoints'],
      passingScore: json['passingScore'],
      timeLimit: json['timeLimit'],
      allowRetakes: json['allowRetakes'] ?? true,
      maxAttempts: json['maxAttempts'] ?? 3,
      createdAt: DateTime.parse(json['createdAt']),
      isAIGenerated: json['isAIGenerated'] ?? false,
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
    );
  }
}

class AssessmentAttempt {
  final String id;
  final String assessmentId;
  final String userId;
  final DateTime startedAt;
  final DateTime? completedAt;
  final List<AssessmentResponse> responses;
  final int score;
  final double percentage;
  final bool isPassed;
  final int attemptNumber;
  final int timeSpent; // Seconds
  final Map<String, MasteryLevel> standardMastery; // Standard ID -> Mastery Level

  const AssessmentAttempt({
    required this.id,
    required this.assessmentId,
    required this.userId,
    required this.startedAt,
    this.completedAt,
    required this.responses,
    required this.score,
    required this.percentage,
    required this.isPassed,
    required this.attemptNumber,
    required this.timeSpent,
    required this.standardMastery,
  });

  factory AssessmentAttempt.start({
    required String assessmentId,
    required String userId,
    required int attemptNumber,
  }) {
    final uuid = const Uuid();
    return AssessmentAttempt(
      id: uuid.v4(),
      assessmentId: assessmentId,
      userId: userId,
      startedAt: DateTime.now(),
      responses: [],
      score: 0,
      percentage: 0.0,
      isPassed: false,
      attemptNumber: attemptNumber,
      timeSpent: 0,
      standardMastery: {},
    );
  }

  AssessmentAttempt complete({
    required Assessment assessment,
    required List<AssessmentResponse> responses,
  }) {
    final score = responses.fold<int>(0, (sum, response) {
      final question = assessment.questions.firstWhere((q) => q.id == response.questionId);
      return sum + (response.isCorrect ? question.points : 0);
    });

    final percentage = assessment.totalPoints > 0 ? (score / assessment.totalPoints) * 100 : 0;
    final isPassed = score >= assessment.passingScore;
    final timeSpent = DateTime.now().difference(startedAt).inSeconds;

    // Calculate standard mastery levels
    final standardMastery = <String, MasteryLevel>{};
    for (final standardId in assessment.standardIds) {
      final standardQuestions = assessment.questions.where((q) => q.standardIds.contains(standardId));
      final standardResponses = responses.where((r) => 
          standardQuestions.any((q) => q.id == r.questionId));
      
      if (standardResponses.isNotEmpty) {
        final correctCount = standardResponses.where((r) => r.isCorrect).length;
        final accuracy = correctCount / standardResponses.length;
        
        if (accuracy >= 0.9) {
          standardMastery[standardId] = MasteryLevel.mastered;
        } else if (accuracy >= 0.8) {
          standardMastery[standardId] = MasteryLevel.proficient;
        } else if (accuracy >= 0.6) {
          standardMastery[standardId] = MasteryLevel.developing;
        } else if (accuracy >= 0.4) {
          standardMastery[standardId] = MasteryLevel.emerging;
        } else {
          standardMastery[standardId] = MasteryLevel.notStarted;
        }
      }
    }

    return AssessmentAttempt(
      id: id,
      assessmentId: assessmentId,
      userId: userId,
      startedAt: startedAt,
      completedAt: DateTime.now(),
      responses: responses,
      score: score,
      percentage: percentage,
      isPassed: isPassed,
      attemptNumber: attemptNumber,
      timeSpent: timeSpent,
      standardMastery: standardMastery,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'assessmentId': assessmentId,
      'userId': userId,
      'startedAt': startedAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'responses': responses.map((r) => r.toJson()).toList(),
      'score': score,
      'percentage': percentage,
      'isPassed': isPassed,
      'attemptNumber': attemptNumber,
      'timeSpent': timeSpent,
      'standardMastery': standardMastery.map((k, v) => MapEntry(k, v.name)),
    };
  }

  factory AssessmentAttempt.fromJson(Map<String, dynamic> json) {
    return AssessmentAttempt(
      id: json['id'],
      assessmentId: json['assessmentId'],
      userId: json['userId'],
      startedAt: DateTime.parse(json['startedAt']),
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt']) : null,
      responses: (json['responses'] as List? ?? [])
          .map((r) => AssessmentResponse.fromJson(r))
          .toList(),
      score: json['score'],
      percentage: json['percentage']?.toDouble() ?? 0.0,
      isPassed: json['isPassed'] ?? false,
      attemptNumber: json['attemptNumber'],
      timeSpent: json['timeSpent'],
      standardMastery: (json['standardMastery'] as Map<String, dynamic>? ?? {})
          .map((k, v) => MapEntry(k, MasteryLevel.values.firstWhere((e) => e.name == v))),
    );
  }
}

class AssessmentResponse {
  final String id;
  final String questionId;
  final List<String> userAnswers;
  final bool isCorrect;
  final int pointsEarned;
  final DateTime answeredAt;
  final int timeSpent; // Seconds on this question

  const AssessmentResponse({
    required this.id,
    required this.questionId,
    required this.userAnswers,
    required this.isCorrect,
    required this.pointsEarned,
    required this.answeredAt,
    required this.timeSpent,
  });

  factory AssessmentResponse.create({
    required String questionId,
    required List<String> userAnswers,
    required AssessmentQuestion question,
    required int timeSpent,
  }) {
    final uuid = const Uuid();
    final isCorrect = question.isCorrect(userAnswers);
    final pointsEarned = isCorrect ? question.points : 0;

    return AssessmentResponse(
      id: uuid.v4(),
      questionId: questionId,
      userAnswers: userAnswers,
      isCorrect: isCorrect,
      pointsEarned: pointsEarned,
      answeredAt: DateTime.now(),
      timeSpent: timeSpent,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionId': questionId,
      'userAnswers': userAnswers,
      'isCorrect': isCorrect,
      'pointsEarned': pointsEarned,
      'answeredAt': answeredAt.toIso8601String(),
      'timeSpent': timeSpent,
    };
  }

  factory AssessmentResponse.fromJson(Map<String, dynamic> json) {
    return AssessmentResponse(
      id: json['id'],
      questionId: json['questionId'],
      userAnswers: List<String>.from(json['userAnswers'] ?? []),
      isCorrect: json['isCorrect'] ?? false,
      pointsEarned: json['pointsEarned'] ?? 0,
      answeredAt: DateTime.parse(json['answeredAt']),
      timeSpent: json['timeSpent'] ?? 0,
    );
  }
}
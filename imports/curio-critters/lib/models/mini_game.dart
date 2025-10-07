import 'package:uuid/uuid.dart';

enum GameType {
  math,
  reading,
  science,
  art,
  memory,
  puzzle,
}

enum GameDifficulty {
  easy,
  medium,
  hard,
  expert,
}

enum GameStatus {
  notStarted,
  inProgress,
  completed,
  failed,
}

class GameQuestion {
  final String id;
  final String question;
  final List<String> options;
  final String correctAnswer;
  final String? explanation;
  final String? imageUrl;
  final String? audioUrl;

  const GameQuestion({
    required this.id,
    required this.question,
    required this.options,
    required this.correctAnswer,
    this.explanation,
    this.imageUrl,
    this.audioUrl,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'question': question,
      'options': options,
      'correctAnswer': correctAnswer,
      'explanation': explanation,
      'imageUrl': imageUrl,
      'audioUrl': audioUrl,
    };
  }

  factory GameQuestion.fromJson(Map<String, dynamic> json) {
    return GameQuestion(
      id: json['id'],
      question: json['question'],
      options: List<String>.from(json['options']),
      correctAnswer: json['correctAnswer'],
      explanation: json['explanation'],
      imageUrl: json['imageUrl'],
      audioUrl: json['audioUrl'],
    );
  }
}

class GameResult {
  final String questionId;
  final String userAnswer;
  final bool isCorrect;
  final int timeSpent; // seconds
  final DateTime answeredAt;

  const GameResult({
    required this.questionId,
    required this.userAnswer,
    required this.isCorrect,
    required this.timeSpent,
    required this.answeredAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'userAnswer': userAnswer,
      'isCorrect': isCorrect,
      'timeSpent': timeSpent,
      'answeredAt': answeredAt.toIso8601String(),
    };
  }

  factory GameResult.fromJson(Map<String, dynamic> json) {
    return GameResult(
      questionId: json['questionId'],
      userAnswer: json['userAnswer'],
      isCorrect: json['isCorrect'],
      timeSpent: json['timeSpent'],
      answeredAt: DateTime.parse(json['answeredAt']),
    );
  }
}

class GameSession {
  final String id;
  final String gameId;
  final String userId;
  final DateTime startedAt;
  final DateTime? completedAt;
  final GameStatus status;
  final List<GameResult> results;
  final int score;
  final int maxScore;
  final int experienceGained;

  const GameSession({
    required this.id,
    required this.gameId,
    required this.userId,
    required this.startedAt,
    this.completedAt,
    required this.status,
    required this.results,
    required this.score,
    required this.maxScore,
    required this.experienceGained,
  });

  factory GameSession.start({
    required String gameId,
    required String userId,
    required int maxScore,
  }) {
    final uuid = const Uuid();
    return GameSession(
      id: uuid.v4(),
      gameId: gameId,
      userId: userId,
      startedAt: DateTime.now(),
      status: GameStatus.inProgress,
      results: [],
      score: 0,
      maxScore: maxScore,
      experienceGained: 0,
    );
  }

  double get accuracyPercentage {
    if (results.isEmpty) return 0.0;
    final correctAnswers = results.where((r) => r.isCorrect).length;
    return (correctAnswers / results.length) * 100;
  }

  int get totalTimeSpent {
    return results.fold(0, (sum, result) => sum + result.timeSpent);
  }

  GameSession copyWith({
    DateTime? completedAt,
    GameStatus? status,
    List<GameResult>? results,
    int? score,
    int? experienceGained,
  }) {
    return GameSession(
      id: id,
      gameId: gameId,
      userId: userId,
      startedAt: startedAt,
      completedAt: completedAt ?? this.completedAt,
      status: status ?? this.status,
      results: results ?? this.results,
      score: score ?? this.score,
      maxScore: maxScore,
      experienceGained: experienceGained ?? this.experienceGained,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'gameId': gameId,
      'userId': userId,
      'startedAt': startedAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'status': status.name,
      'results': results.map((r) => r.toJson()).toList(),
      'score': score,
      'maxScore': maxScore,
      'experienceGained': experienceGained,
    };
  }

  factory GameSession.fromJson(Map<String, dynamic> json) {
    return GameSession(
      id: json['id'],
      gameId: json['gameId'],
      userId: json['userId'],
      startedAt: DateTime.parse(json['startedAt']),
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt']) 
          : null,
      status: GameStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => GameStatus.notStarted,
      ),
      results: (json['results'] as List)
          .map((r) => GameResult.fromJson(r))
          .toList(),
      score: json['score'],
      maxScore: json['maxScore'],
      experienceGained: json['experienceGained'],
    );
  }
}

class MiniGame {
  final String id;
  final String title;
  final String description;
  final GameType type;
  final GameDifficulty difficulty;
  final List<GameQuestion> questions;
  final int targetAge; // minimum age
  final int estimatedDuration; // minutes
  final List<String> learningObjectives;
  final String iconUrl;
  final String backgroundUrl;
  final bool isUnlocked;
  final Map<String, dynamic> gameConfig; // Game-specific configuration

  const MiniGame({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.difficulty,
    required this.questions,
    required this.targetAge,
    required this.estimatedDuration,
    required this.learningObjectives,
    required this.iconUrl,
    required this.backgroundUrl,
    required this.isUnlocked,
    required this.gameConfig,
  });

  factory MiniGame.create({
    required String title,
    required String description,
    required GameType type,
    required GameDifficulty difficulty,
    required int targetAge,
    required List<String> learningObjectives,
  }) {
    final uuid = const Uuid();
    return MiniGame(
      id: uuid.v4(),
      title: title,
      description: description,
      type: type,
      difficulty: difficulty,
      questions: [],
      targetAge: targetAge,
      estimatedDuration: 5, // Default 5 minutes
      learningObjectives: learningObjectives,
      iconUrl: 'assets/images/games/${type.name}_icon.png',
      backgroundUrl: 'assets/images/backgrounds/${type.name}_bg.png',
      isUnlocked: true,
      gameConfig: {},
    );
  }

  bool isAppropriateForAge(int userAge) {
    return userAge >= targetAge && userAge <= (targetAge + 2);
  }

  MiniGame copyWith({
    String? title,
    String? description,
    GameType? type,
    GameDifficulty? difficulty,
    List<GameQuestion>? questions,
    int? targetAge,
    int? estimatedDuration,
    List<String>? learningObjectives,
    String? iconUrl,
    String? backgroundUrl,
    bool? isUnlocked,
    Map<String, dynamic>? gameConfig,
  }) {
    return MiniGame(
      id: id,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      difficulty: difficulty ?? this.difficulty,
      questions: questions ?? this.questions,
      targetAge: targetAge ?? this.targetAge,
      estimatedDuration: estimatedDuration ?? this.estimatedDuration,
      learningObjectives: learningObjectives ?? this.learningObjectives,
      iconUrl: iconUrl ?? this.iconUrl,
      backgroundUrl: backgroundUrl ?? this.backgroundUrl,
      isUnlocked: isUnlocked ?? this.isUnlocked,
      gameConfig: gameConfig ?? this.gameConfig,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type.name,
      'difficulty': difficulty.name,
      'questions': questions.map((q) => q.toJson()).toList(),
      'targetAge': targetAge,
      'estimatedDuration': estimatedDuration,
      'learningObjectives': learningObjectives,
      'iconUrl': iconUrl,
      'backgroundUrl': backgroundUrl,
      'isUnlocked': isUnlocked,
      'gameConfig': gameConfig,
    };
  }

  factory MiniGame.fromJson(Map<String, dynamic> json) {
    return MiniGame(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      type: GameType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => GameType.math,
      ),
      difficulty: GameDifficulty.values.firstWhere(
        (e) => e.name == json['difficulty'],
        orElse: () => GameDifficulty.easy,
      ),
      questions: (json['questions'] as List)
          .map((q) => GameQuestion.fromJson(q))
          .toList(),
      targetAge: json['targetAge'],
      estimatedDuration: json['estimatedDuration'],
      learningObjectives: List<String>.from(json['learningObjectives']),
      iconUrl: json['iconUrl'],
      backgroundUrl: json['backgroundUrl'],
      isUnlocked: json['isUnlocked'] ?? true,
      gameConfig: Map<String, dynamic>.from(json['gameConfig'] ?? {}),
    );
  }
}
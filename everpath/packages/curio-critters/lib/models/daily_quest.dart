import 'package:uuid/uuid.dart';
import 'curriculum.dart';

enum QuestType {
  lesson, // Complete a lesson
  practice, // Practice activities
  assessment, // Take an assessment
  review, // Review previous material
  creative, // Creative/art project
  reading, // Independent reading
  exploration, // Science exploration
}

enum QuestStatus {
  notStarted,
  inProgress,
  completed,
  skipped,
  failed,
}

enum QuestPriority {
  low,
  medium,
  high,
  critical, // Must complete today
}

class DailyQuest {
  final String id;
  final String title;
  final String description;
  final QuestType type;
  final Subject subject;
  final QuestPriority priority;
  final List<String> objectiveIds; // Learning objectives addressed
  final List<String> standardIds; // Standards addressed
  final String? lessonId; // If quest is lesson-based
  final String? assessmentId; // If quest is assessment-based
  final Map<String, dynamic> configuration; // Quest-specific settings
  final int estimatedMinutes;
  final int experienceReward; // XP for creature
  final Map<String, int> statRewards; // Creature stat bonuses
  final DateTime createdAt;
  final DateTime dueDate;
  final bool isRequired;
  final List<String> prerequisites; // Other quest IDs that must be completed first

  const DailyQuest({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.subject,
    required this.priority,
    required this.objectiveIds,
    required this.standardIds,
    this.lessonId,
    this.assessmentId,
    required this.configuration,
    required this.estimatedMinutes,
    required this.experienceReward,
    required this.statRewards,
    required this.createdAt,
    required this.dueDate,
    required this.isRequired,
    required this.prerequisites,
  });

  factory DailyQuest.create({
    required String title,
    required String description,
    required QuestType type,
    required Subject subject,
    required QuestPriority priority,
    required List<String> objectiveIds,
    String? lessonId,
    String? assessmentId,
    int? estimatedMinutes,
    DateTime? dueDate,
    bool isRequired = false,
  }) {
    final uuid = const Uuid();
    final now = DateTime.now();
    
    return DailyQuest(
      id: uuid.v4(),
      title: title,
      description: description,
      type: type,
      subject: subject,
      priority: priority,
      objectiveIds: objectiveIds,
      standardIds: [], // Will be populated based on objectives
      lessonId: lessonId,
      assessmentId: assessmentId,
      configuration: {},
      estimatedMinutes: estimatedMinutes ?? _getDefaultDuration(type),
      experienceReward: _calculateExperienceReward(type, priority),
      statRewards: _getStatRewards(type, subject),
      createdAt: now,
      dueDate: dueDate ?? DateTime(now.year, now.month, now.day, 23, 59),
      isRequired: isRequired,
      prerequisites: [],
    );
  }

  static int _getDefaultDuration(QuestType type) {
    switch (type) {
      case QuestType.lesson:
        return 30;
      case QuestType.practice:
        return 15;
      case QuestType.assessment:
        return 20;
      case QuestType.review:
        return 10;
      case QuestType.creative:
        return 25;
      case QuestType.reading:
        return 20;
      case QuestType.exploration:
        return 30;
    }
  }

  static int _calculateExperienceReward(QuestType type, QuestPriority priority) {
    int baseXP = 50;
    
    switch (type) {
      case QuestType.lesson:
        baseXP = 100;
        break;
      case QuestType.assessment:
        baseXP = 150;
        break;
      case QuestType.practice:
        baseXP = 75;
        break;
      case QuestType.review:
        baseXP = 50;
        break;
      case QuestType.creative:
        baseXP = 80;
        break;
      case QuestType.reading:
        baseXP = 60;
        break;
      case QuestType.exploration:
        baseXP = 90;
        break;
    }

    // Priority multiplier
    switch (priority) {
      case QuestPriority.low:
        return (baseXP * 0.8).round();
      case QuestPriority.medium:
        return baseXP;
      case QuestPriority.high:
        return (baseXP * 1.2).round();
      case QuestPriority.critical:
        return (baseXP * 1.5).round();
    }
  }

  static Map<String, int> _getStatRewards(QuestType type, Subject subject) {
    Map<String, int> rewards = {
      'happiness': 0,
      'intelligence': 0,
      'energy': 0,
    };

    // Base rewards by quest type
    switch (type) {
      case QuestType.lesson:
        rewards['intelligence'] = 5;
        rewards['happiness'] = 3;
        break;
      case QuestType.practice:
        rewards['intelligence'] = 3;
        rewards['happiness'] = 2;
        break;
      case QuestType.assessment:
        rewards['intelligence'] = 8;
        rewards['happiness'] = 5;
        break;
      case QuestType.review:
        rewards['intelligence'] = 2;
        rewards['happiness'] = 1;
        break;
      case QuestType.creative:
        rewards['happiness'] = 8;
        rewards['intelligence'] = 3;
        break;
      case QuestType.reading:
        rewards['intelligence'] = 4;
        rewards['happiness'] = 4;
        break;
      case QuestType.exploration:
        rewards['intelligence'] = 6;
        rewards['happiness'] = 6;
        break;
    }

    // Subject-specific bonuses
    switch (subject) {
      case Subject.math:
        rewards['intelligence'] = (rewards['intelligence']! * 1.2).round();
        break;
      case Subject.reading:
        rewards['intelligence'] = (rewards['intelligence']! * 1.1).round();
        rewards['happiness'] = (rewards['happiness']! * 1.1).round();
        break;
      case Subject.art:
        rewards['happiness'] = (rewards['happiness']! * 1.3).round();
        break;
      case Subject.science:
        rewards['intelligence'] = (rewards['intelligence']! * 1.15).round();
        break;
      default:
        break;
    }

    return rewards;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type.name,
      'subject': subject.name,
      'priority': priority.name,
      'objectiveIds': objectiveIds,
      'standardIds': standardIds,
      'lessonId': lessonId,
      'assessmentId': assessmentId,
      'configuration': configuration,
      'estimatedMinutes': estimatedMinutes,
      'experienceReward': experienceReward,
      'statRewards': statRewards,
      'createdAt': createdAt.toIso8601String(),
      'dueDate': dueDate.toIso8601String(),
      'isRequired': isRequired,
      'prerequisites': prerequisites,
    };
  }

  factory DailyQuest.fromJson(Map<String, dynamic> json) {
    return DailyQuest(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      type: QuestType.values.firstWhere((e) => e.name == json['type']),
      subject: Subject.values.firstWhere((e) => e.name == json['subject']),
      priority: QuestPriority.values.firstWhere((e) => e.name == json['priority']),
      objectiveIds: List<String>.from(json['objectiveIds'] ?? []),
      standardIds: List<String>.from(json['standardIds'] ?? []),
      lessonId: json['lessonId'],
      assessmentId: json['assessmentId'],
      configuration: Map<String, dynamic>.from(json['configuration'] ?? {}),
      estimatedMinutes: json['estimatedMinutes'],
      experienceReward: json['experienceReward'],
      statRewards: Map<String, int>.from(json['statRewards'] ?? {}),
      createdAt: DateTime.parse(json['createdAt']),
      dueDate: DateTime.parse(json['dueDate']),
      isRequired: json['isRequired'] ?? false,
      prerequisites: List<String>.from(json['prerequisites'] ?? []),
    );
  }
}

class QuestProgress {
  final String id;
  final String questId;
  final String userId;
  final QuestStatus status;
  final DateTime startedAt;
  final DateTime? completedAt;
  final int progressPercentage; // 0-100
  final Map<String, dynamic> progressData; // Quest-specific progress tracking
  final int timeSpent; // Minutes
  final List<String> completedActivities;
  final Map<String, dynamic> results; // Assessment scores, etc.

  const QuestProgress({
    required this.id,
    required this.questId,
    required this.userId,
    required this.status,
    required this.startedAt,
    this.completedAt,
    required this.progressPercentage,
    required this.progressData,
    required this.timeSpent,
    required this.completedActivities,
    required this.results,
  });

  factory QuestProgress.start({
    required String questId,
    required String userId,
  }) {
    final uuid = const Uuid();
    return QuestProgress(
      id: uuid.v4(),
      questId: questId,
      userId: userId,
      status: QuestStatus.inProgress,
      startedAt: DateTime.now(),
      progressPercentage: 0,
      progressData: {},
      timeSpent: 0,
      completedActivities: [],
      results: {},
    );
  }

  QuestProgress updateProgress({
    int? progressPercentage,
    Map<String, dynamic>? progressData,
    int? additionalTime,
    List<String>? newCompletedActivities,
    Map<String, dynamic>? results,
  }) {
    return QuestProgress(
      id: id,
      questId: questId,
      userId: userId,
      status: (progressPercentage ?? this.progressPercentage) >= 100 
          ? QuestStatus.completed 
          : status,
      startedAt: startedAt,
      completedAt: (progressPercentage ?? this.progressPercentage) >= 100 
          ? DateTime.now() 
          : completedAt,
      progressPercentage: progressPercentage ?? this.progressPercentage,
      progressData: progressData ?? this.progressData,
      timeSpent: timeSpent + (additionalTime ?? 0),
      completedActivities: newCompletedActivities ?? completedActivities,
      results: results ?? this.results,
    );
  }

  QuestProgress complete({
    Map<String, dynamic>? finalResults,
  }) {
    return QuestProgress(
      id: id,
      questId: questId,
      userId: userId,
      status: QuestStatus.completed,
      startedAt: startedAt,
      completedAt: DateTime.now(),
      progressPercentage: 100,
      progressData: progressData,
      timeSpent: timeSpent,
      completedActivities: completedActivities,
      results: finalResults ?? results,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questId': questId,
      'userId': userId,
      'status': status.name,
      'startedAt': startedAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'progressPercentage': progressPercentage,
      'progressData': progressData,
      'timeSpent': timeSpent,
      'completedActivities': completedActivities,
      'results': results,
    };
  }

  factory QuestProgress.fromJson(Map<String, dynamic> json) {
    return QuestProgress(
      id: json['id'],
      questId: json['questId'],
      userId: json['userId'],
      status: QuestStatus.values.firstWhere((e) => e.name == json['status']),
      startedAt: DateTime.parse(json['startedAt']),
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt']) : null,
      progressPercentage: json['progressPercentage'],
      progressData: Map<String, dynamic>.from(json['progressData'] ?? {}),
      timeSpent: json['timeSpent'],
      completedActivities: List<String>.from(json['completedActivities'] ?? []),
      results: Map<String, dynamic>.from(json['results'] ?? {}),
    );
  }
}

class DailyQuestPlan {
  final String id;
  final String userId;
  final DateTime date;
  final List<String> questIds;
  final Map<Subject, int> subjectMinutes; // Planned time per subject
  final int totalEstimatedMinutes;
  final bool isGenerated; // AI-generated vs manually created
  final DateTime createdAt;
  final Map<String, dynamic> metadata;

  const DailyQuestPlan({
    required this.id,
    required this.userId,
    required this.date,
    required this.questIds,
    required this.subjectMinutes,
    required this.totalEstimatedMinutes,
    required this.isGenerated,
    required this.createdAt,
    required this.metadata,
  });

  factory DailyQuestPlan.create({
    required String userId,
    required DateTime date,
    required List<String> questIds,
    required Map<Subject, int> subjectMinutes,
    bool isGenerated = true,
  }) {
    final uuid = const Uuid();
    final totalMinutes = subjectMinutes.values.fold<int>(0, (sum, minutes) => sum + minutes);
    
    return DailyQuestPlan(
      id: uuid.v4(),
      userId: userId,
      date: DateTime(date.year, date.month, date.day), // Normalize to date only
      questIds: questIds,
      subjectMinutes: subjectMinutes,
      totalEstimatedMinutes: totalMinutes,
      isGenerated: isGenerated,
      createdAt: DateTime.now(),
      metadata: {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'date': date.toIso8601String(),
      'questIds': questIds,
      'subjectMinutes': subjectMinutes.map((k, v) => MapEntry(k.name, v)),
      'totalEstimatedMinutes': totalEstimatedMinutes,
      'isGenerated': isGenerated,
      'createdAt': createdAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  factory DailyQuestPlan.fromJson(Map<String, dynamic> json) {
    return DailyQuestPlan(
      id: json['id'],
      userId: json['userId'],
      date: DateTime.parse(json['date']),
      questIds: List<String>.from(json['questIds'] ?? []),
      subjectMinutes: (json['subjectMinutes'] as Map<String, dynamic>? ?? {})
          .map((k, v) => MapEntry(
              Subject.values.firstWhere((e) => e.name == k), 
              v as int)),
      totalEstimatedMinutes: json['totalEstimatedMinutes'],
      isGenerated: json['isGenerated'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
    );
  }
}
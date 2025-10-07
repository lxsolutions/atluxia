import 'package:uuid/uuid.dart';

enum Subject {
  math,
  reading,
  writing,
  science,
  art,
  socialStudies,
}

enum GradeLevel {
  preK, // Age 4
  kindergarten, // Age 5
  grade1, // Age 6
  grade2, // Age 7
  grade3, // Age 8
  grade4, // Age 9
}

enum StandardsFramework {
  commonCore,
  ngss,
  state,
  custom,
}

enum MasteryLevel {
  notStarted,
  emerging,
  developing,
  proficient,
  advanced,
  mastered,
}

class LearningStandard {
  final String id;
  final String code; // e.g., "K.CC.A.1" for Common Core
  final String title;
  final String description;
  final Subject subject;
  final GradeLevel gradeLevel;
  final StandardsFramework framework;
  final List<String> prerequisites; // Other standard IDs
  final List<String> keywords;
  final int estimatedHours; // Time to master
  final bool isRequired;

  const LearningStandard({
    required this.id,
    required this.code,
    required this.title,
    required this.description,
    required this.subject,
    required this.gradeLevel,
    required this.framework,
    required this.prerequisites,
    required this.keywords,
    required this.estimatedHours,
    required this.isRequired,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'title': title,
      'description': description,
      'subject': subject.name,
      'gradeLevel': gradeLevel.name,
      'framework': framework.name,
      'prerequisites': prerequisites,
      'keywords': keywords,
      'estimatedHours': estimatedHours,
      'isRequired': isRequired,
    };
  }

  factory LearningStandard.fromJson(Map<String, dynamic> json) {
    return LearningStandard(
      id: json['id'],
      code: json['code'],
      title: json['title'],
      description: json['description'],
      subject: Subject.values.firstWhere((e) => e.name == json['subject']),
      gradeLevel: GradeLevel.values.firstWhere((e) => e.name == json['gradeLevel']),
      framework: StandardsFramework.values.firstWhere((e) => e.name == json['framework']),
      prerequisites: List<String>.from(json['prerequisites'] ?? []),
      keywords: List<String>.from(json['keywords'] ?? []),
      estimatedHours: json['estimatedHours'],
      isRequired: json['isRequired'] ?? true,
    );
  }
}

class LearningObjective {
  final String id;
  final String standardId;
  final String title;
  final String description;
  final List<String> activities; // Types of activities that address this objective
  final Map<String, dynamic> assessmentCriteria;
  final int sequenceOrder; // Order within the standard

  const LearningObjective({
    required this.id,
    required this.standardId,
    required this.title,
    required this.description,
    required this.activities,
    required this.assessmentCriteria,
    required this.sequenceOrder,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'standardId': standardId,
      'title': title,
      'description': description,
      'activities': activities,
      'assessmentCriteria': assessmentCriteria,
      'sequenceOrder': sequenceOrder,
    };
  }

  factory LearningObjective.fromJson(Map<String, dynamic> json) {
    return LearningObjective(
      id: json['id'],
      standardId: json['standardId'],
      title: json['title'],
      description: json['description'],
      activities: List<String>.from(json['activities'] ?? []),
      assessmentCriteria: Map<String, dynamic>.from(json['assessmentCriteria'] ?? {}),
      sequenceOrder: json['sequenceOrder'],
    );
  }
}

class Lesson {
  final String id;
  final String title;
  final String description;
  final Subject subject;
  final GradeLevel gradeLevel;
  final List<String> objectiveIds;
  final List<String> standardIds;
  final String content; // Main lesson content
  final List<LessonActivity> activities;
  final Map<String, dynamic> materials; // Required materials/resources
  final int estimatedMinutes;
  final DateTime createdAt;
  final bool isAIGenerated;
  final Map<String, dynamic> metadata;

  const Lesson({
    required this.id,
    required this.title,
    required this.description,
    required this.subject,
    required this.gradeLevel,
    required this.objectiveIds,
    required this.standardIds,
    required this.content,
    required this.activities,
    required this.materials,
    required this.estimatedMinutes,
    required this.createdAt,
    required this.isAIGenerated,
    required this.metadata,
  });

  factory Lesson.create({
    required String title,
    required String description,
    required Subject subject,
    required GradeLevel gradeLevel,
    required List<String> objectiveIds,
    required String content,
    List<LessonActivity>? activities,
    int? estimatedMinutes,
    bool isAIGenerated = false,
  }) {
    final uuid = const Uuid();
    return Lesson(
      id: uuid.v4(),
      title: title,
      description: description,
      subject: subject,
      gradeLevel: gradeLevel,
      objectiveIds: objectiveIds,
      standardIds: [], // Will be populated based on objectives
      content: content,
      activities: activities ?? [],
      materials: {},
      estimatedMinutes: estimatedMinutes ?? 30,
      createdAt: DateTime.now(),
      isAIGenerated: isAIGenerated,
      metadata: {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'subject': subject.name,
      'gradeLevel': gradeLevel.name,
      'objectiveIds': objectiveIds,
      'standardIds': standardIds,
      'content': content,
      'activities': activities.map((a) => a.toJson()).toList(),
      'materials': materials,
      'estimatedMinutes': estimatedMinutes,
      'createdAt': createdAt.toIso8601String(),
      'isAIGenerated': isAIGenerated,
      'metadata': metadata,
    };
  }

  factory Lesson.fromJson(Map<String, dynamic> json) {
    return Lesson(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      subject: Subject.values.firstWhere((e) => e.name == json['subject']),
      gradeLevel: GradeLevel.values.firstWhere((e) => e.name == json['gradeLevel']),
      objectiveIds: List<String>.from(json['objectiveIds'] ?? []),
      standardIds: List<String>.from(json['standardIds'] ?? []),
      content: json['content'],
      activities: (json['activities'] as List? ?? [])
          .map((a) => LessonActivity.fromJson(a))
          .toList(),
      materials: Map<String, dynamic>.from(json['materials'] ?? {}),
      estimatedMinutes: json['estimatedMinutes'],
      createdAt: DateTime.parse(json['createdAt']),
      isAIGenerated: json['isAIGenerated'] ?? false,
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
    );
  }
}

class LessonActivity {
  final String id;
  final String title;
  final String description;
  final String type; // 'practice', 'game', 'assessment', 'creative', 'discussion'
  final String instructions;
  final Map<String, dynamic> configuration;
  final int estimatedMinutes;
  final bool isRequired;

  const LessonActivity({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.instructions,
    required this.configuration,
    required this.estimatedMinutes,
    required this.isRequired,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type,
      'instructions': instructions,
      'configuration': configuration,
      'estimatedMinutes': estimatedMinutes,
      'isRequired': isRequired,
    };
  }

  factory LessonActivity.fromJson(Map<String, dynamic> json) {
    return LessonActivity(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      type: json['type'],
      instructions: json['instructions'],
      configuration: Map<String, dynamic>.from(json['configuration'] ?? {}),
      estimatedMinutes: json['estimatedMinutes'],
      isRequired: json['isRequired'] ?? true,
    );
  }
}

class CurriculumScope {
  final String id;
  final String name;
  final String description;
  final GradeLevel gradeLevel;
  final Map<Subject, List<String>> subjectStandards; // Subject -> Standard IDs
  final Map<String, int> weeklyHours; // Subject -> hours per week
  final List<String> requiredStandardIds;
  final List<String> optionalStandardIds;
  final DateTime startDate;
  final DateTime endDate;
  final bool isActive;

  const CurriculumScope({
    required this.id,
    required this.name,
    required this.description,
    required this.gradeLevel,
    required this.subjectStandards,
    required this.weeklyHours,
    required this.requiredStandardIds,
    required this.optionalStandardIds,
    required this.startDate,
    required this.endDate,
    required this.isActive,
  });

  factory CurriculumScope.createYearlyScope({
    required String name,
    required GradeLevel gradeLevel,
    required DateTime schoolYearStart,
  }) {
    final uuid = const Uuid();
    return CurriculumScope(
      id: uuid.v4(),
      name: name,
      description: 'Full year curriculum for ${gradeLevel.name}',
      gradeLevel: gradeLevel,
      subjectStandards: _getDefaultSubjectStandards(gradeLevel),
      weeklyHours: _getDefaultWeeklyHours(),
      requiredStandardIds: [],
      optionalStandardIds: [],
      startDate: schoolYearStart,
      endDate: schoolYearStart.add(const Duration(days: 180)), // ~36 weeks
      isActive: true,
    );
  }

  static Map<Subject, List<String>> _getDefaultSubjectStandards(GradeLevel grade) {
    // This would be populated with actual standard IDs based on grade level
    return {
      Subject.math: [],
      Subject.reading: [],
      Subject.writing: [],
      Subject.science: [],
      Subject.art: [],
    };
  }

  static Map<String, int> _getDefaultWeeklyHours() {
    return {
      'math': 5, // 1 hour per day
      'reading': 5,
      'writing': 3,
      'science': 3,
      'art': 2,
      'socialStudies': 2,
    };
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'gradeLevel': gradeLevel.name,
      'subjectStandards': subjectStandards.map(
        (k, v) => MapEntry(k.name, v),
      ),
      'weeklyHours': weeklyHours,
      'requiredStandardIds': requiredStandardIds,
      'optionalStandardIds': optionalStandardIds,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'isActive': isActive,
    };
  }

  factory CurriculumScope.fromJson(Map<String, dynamic> json) {
    return CurriculumScope(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      gradeLevel: GradeLevel.values.firstWhere((e) => e.name == json['gradeLevel']),
      subjectStandards: (json['subjectStandards'] as Map<String, dynamic>).map(
        (k, v) => MapEntry(
          Subject.values.firstWhere((e) => e.name == k),
          List<String>.from(v),
        ),
      ),
      weeklyHours: Map<String, int>.from(json['weeklyHours'] ?? {}),
      requiredStandardIds: List<String>.from(json['requiredStandardIds'] ?? []),
      optionalStandardIds: List<String>.from(json['optionalStandardIds'] ?? []),
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      isActive: json['isActive'] ?? true,
    );
  }
}
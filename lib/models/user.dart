import 'package:uuid/uuid.dart';
import 'curriculum.dart';

enum AgeGroup {
  preschool, // 4-5 years
  kindergarten, // 5-6 years
  earlyElementary, // 6-7 years
  elementary, // 7-9 years
}

enum LearningStyle {
  visual,
  auditory,
  kinesthetic,
  mixed,
}

class UserPreferences {
  final List<String> favoriteSubjects;
  final LearningStyle learningStyle;
  final int difficultyLevel; // 1-10
  final bool soundEnabled;
  final bool animationsEnabled;
  final int dailyPlayTimeLimit; // minutes
  final Map<String, bool> parentalControls;

  const UserPreferences({
    required this.favoriteSubjects,
    required this.learningStyle,
    required this.difficultyLevel,
    required this.soundEnabled,
    required this.animationsEnabled,
    required this.dailyPlayTimeLimit,
    required this.parentalControls,
  });

  factory UserPreferences.defaultPreferences() {
    return const UserPreferences(
      favoriteSubjects: ['math', 'reading'],
      learningStyle: LearningStyle.mixed,
      difficultyLevel: 3,
      soundEnabled: true,
      animationsEnabled: true,
      dailyPlayTimeLimit: 60, // 1 hour
      parentalControls: {
        'allowNewContent': true,
        'requireParentApproval': false,
        'shareProgress': true,
      },
    );
  }

  UserPreferences copyWith({
    List<String>? favoriteSubjects,
    LearningStyle? learningStyle,
    int? difficultyLevel,
    bool? soundEnabled,
    bool? animationsEnabled,
    int? dailyPlayTimeLimit,
    Map<String, bool>? parentalControls,
  }) {
    return UserPreferences(
      favoriteSubjects: favoriteSubjects ?? this.favoriteSubjects,
      learningStyle: learningStyle ?? this.learningStyle,
      difficultyLevel: difficultyLevel ?? this.difficultyLevel,
      soundEnabled: soundEnabled ?? this.soundEnabled,
      animationsEnabled: animationsEnabled ?? this.animationsEnabled,
      dailyPlayTimeLimit: dailyPlayTimeLimit ?? this.dailyPlayTimeLimit,
      parentalControls: parentalControls ?? this.parentalControls,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'favoriteSubjects': favoriteSubjects,
      'learningStyle': learningStyle.name,
      'difficultyLevel': difficultyLevel,
      'soundEnabled': soundEnabled,
      'animationsEnabled': animationsEnabled,
      'dailyPlayTimeLimit': dailyPlayTimeLimit,
      'parentalControls': parentalControls,
    };
  }

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      favoriteSubjects: List<String>.from(json['favoriteSubjects'] ?? []),
      learningStyle: LearningStyle.values.firstWhere(
        (e) => e.name == json['learningStyle'],
        orElse: () => LearningStyle.mixed,
      ),
      difficultyLevel: json['difficultyLevel'] ?? 3,
      soundEnabled: json['soundEnabled'] ?? true,
      animationsEnabled: json['animationsEnabled'] ?? true,
      dailyPlayTimeLimit: json['dailyPlayTimeLimit'] ?? 60,
      parentalControls: Map<String, bool>.from(json['parentalControls'] ?? {}),
    );
  }
}

class LearningProgress {
  final Map<String, int> subjectLevels; // subject -> level
  final Map<String, int> subjectExperience; // subject -> XP
  final Map<String, DateTime> lastPlayed; // subject -> last played date
  final int totalGamesPlayed;
  final int totalTimeSpent; // minutes
  final List<String> achievements;
  final Map<String, double> accuracyRates; // subject -> accuracy percentage
  
  // Enhanced homeschool tracking
  final Map<String, MasteryLevel> standardMastery; // standard ID -> mastery level
  final Map<String, int> subjectHours; // subject -> total hours logged
  final Map<String, List<String>> completedLessons; // subject -> lesson IDs
  final Map<String, List<String>> completedAssessments; // subject -> assessment IDs
  final GradeLevel currentGradeLevel;
  final DateTime schoolYearStart;
  final Map<String, DateTime> subjectLastAssessed; // subject -> last assessment date
  final Map<String, double> subjectProgressPercentage; // subject -> % complete for grade level

  const LearningProgress({
    required this.subjectLevels,
    required this.subjectExperience,
    required this.lastPlayed,
    required this.totalGamesPlayed,
    required this.totalTimeSpent,
    required this.achievements,
    required this.accuracyRates,
    required this.standardMastery,
    required this.subjectHours,
    required this.completedLessons,
    required this.completedAssessments,
    required this.currentGradeLevel,
    required this.schoolYearStart,
    required this.subjectLastAssessed,
    required this.subjectProgressPercentage,
  });

  factory LearningProgress.initial({GradeLevel? gradeLevel}) {
    final now = DateTime.now();
    final schoolYearStart = DateTime(now.month >= 8 ? now.year : now.year - 1, 8, 1);
    
    return LearningProgress(
      subjectLevels: {
        'math': 1,
        'reading': 1,
        'writing': 1,
        'science': 1,
        'art': 1,
        'socialStudies': 1,
      },
      subjectExperience: {
        'math': 0,
        'reading': 0,
        'writing': 0,
        'science': 0,
        'art': 0,
        'socialStudies': 0,
      },
      lastPlayed: {},
      totalGamesPlayed: 0,
      totalTimeSpent: 0,
      achievements: [],
      accuracyRates: {},
      standardMastery: {},
      subjectHours: {
        'math': 0,
        'reading': 0,
        'writing': 0,
        'science': 0,
        'art': 0,
        'socialStudies': 0,
      },
      completedLessons: {
        'math': [],
        'reading': [],
        'writing': [],
        'science': [],
        'art': [],
        'socialStudies': [],
      },
      completedAssessments: {
        'math': [],
        'reading': [],
        'writing': [],
        'science': [],
        'art': [],
        'socialStudies': [],
      },
      currentGradeLevel: gradeLevel ?? GradeLevel.kindergarten,
      schoolYearStart: schoolYearStart,
      subjectLastAssessed: {},
      subjectProgressPercentage: {
        'math': 0.0,
        'reading': 0.0,
        'writing': 0.0,
        'science': 0.0,
        'art': 0.0,
        'socialStudies': 0.0,
      },
    );
  }

  LearningProgress copyWith({
    Map<String, int>? subjectLevels,
    Map<String, int>? subjectExperience,
    Map<String, DateTime>? lastPlayed,
    int? totalGamesPlayed,
    int? totalTimeSpent,
    List<String>? achievements,
    Map<String, double>? accuracyRates,
    Map<String, MasteryLevel>? standardMastery,
    Map<String, int>? subjectHours,
    Map<String, List<String>>? completedLessons,
    Map<String, List<String>>? completedAssessments,
    GradeLevel? currentGradeLevel,
    DateTime? schoolYearStart,
    Map<String, DateTime>? subjectLastAssessed,
    Map<String, double>? subjectProgressPercentage,
  }) {
    return LearningProgress(
      subjectLevels: subjectLevels ?? this.subjectLevels,
      subjectExperience: subjectExperience ?? this.subjectExperience,
      lastPlayed: lastPlayed ?? this.lastPlayed,
      totalGamesPlayed: totalGamesPlayed ?? this.totalGamesPlayed,
      totalTimeSpent: totalTimeSpent ?? this.totalTimeSpent,
      achievements: achievements ?? this.achievements,
      accuracyRates: accuracyRates ?? this.accuracyRates,
      standardMastery: standardMastery ?? this.standardMastery,
      subjectHours: subjectHours ?? this.subjectHours,
      completedLessons: completedLessons ?? this.completedLessons,
      completedAssessments: completedAssessments ?? this.completedAssessments,
      currentGradeLevel: currentGradeLevel ?? this.currentGradeLevel,
      schoolYearStart: schoolYearStart ?? this.schoolYearStart,
      subjectLastAssessed: subjectLastAssessed ?? this.subjectLastAssessed,
      subjectProgressPercentage: subjectProgressPercentage ?? this.subjectProgressPercentage,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'subjectLevels': subjectLevels,
      'subjectExperience': subjectExperience,
      'lastPlayed': lastPlayed.map((k, v) => MapEntry(k, v.toIso8601String())),
      'totalGamesPlayed': totalGamesPlayed,
      'totalTimeSpent': totalTimeSpent,
      'achievements': achievements,
      'accuracyRates': accuracyRates,
      'standardMastery': standardMastery.map((k, v) => MapEntry(k, v.name)),
      'subjectHours': subjectHours,
      'completedLessons': completedLessons,
      'completedAssessments': completedAssessments,
      'currentGradeLevel': currentGradeLevel.name,
      'schoolYearStart': schoolYearStart.toIso8601String(),
      'subjectLastAssessed': subjectLastAssessed.map((k, v) => MapEntry(k, v.toIso8601String())),
      'subjectProgressPercentage': subjectProgressPercentage,
    };
  }

  factory LearningProgress.fromJson(Map<String, dynamic> json) {
    return LearningProgress(
      subjectLevels: Map<String, int>.from(json['subjectLevels'] ?? {}),
      subjectExperience: Map<String, int>.from(json['subjectExperience'] ?? {}),
      lastPlayed: (json['lastPlayed'] as Map<String, dynamic>? ?? {})
          .map((k, v) => MapEntry(k, DateTime.parse(v))),
      totalGamesPlayed: json['totalGamesPlayed'] ?? 0,
      totalTimeSpent: json['totalTimeSpent'] ?? 0,
      achievements: List<String>.from(json['achievements'] ?? []),
      accuracyRates: Map<String, double>.from(json['accuracyRates'] ?? {}),
      standardMastery: (json['standardMastery'] as Map<String, dynamic>? ?? {})
          .map((k, v) => MapEntry(k, MasteryLevel.values.firstWhere((e) => e.name == v))),
      subjectHours: Map<String, int>.from(json['subjectHours'] ?? {}),
      completedLessons: (json['completedLessons'] as Map<String, dynamic>? ?? {})
          .map((k, v) => MapEntry(k, List<String>.from(v ?? []))),
      completedAssessments: (json['completedAssessments'] as Map<String, dynamic>? ?? {})
          .map((k, v) => MapEntry(k, List<String>.from(v ?? []))),
      currentGradeLevel: GradeLevel.values.firstWhere(
        (e) => e.name == json['currentGradeLevel'],
        orElse: () => GradeLevel.kindergarten,
      ),
      schoolYearStart: json['schoolYearStart'] != null 
          ? DateTime.parse(json['schoolYearStart'])
          : DateTime.now(),
      subjectLastAssessed: (json['subjectLastAssessed'] as Map<String, dynamic>? ?? {})
          .map((k, v) => MapEntry(k, DateTime.parse(v))),
      subjectProgressPercentage: Map<String, double>.from(json['subjectProgressPercentage'] ?? {}),
    );
  }
}

class User {
  final String id;
  final String name;
  final AgeGroup ageGroup;
  final DateTime birthDate;
  final DateTime createdAt;
  final UserPreferences preferences;
  final LearningProgress progress;
  final List<String> creatureIds;
  final String? parentEmail;
  final bool isParentVerified;

  const User({
    required this.id,
    required this.name,
    required this.ageGroup,
    required this.birthDate,
    required this.createdAt,
    required this.preferences,
    required this.progress,
    required this.creatureIds,
    this.parentEmail,
    required this.isParentVerified,
  });

  factory User.create({
    required String name,
    required DateTime birthDate,
    String? parentEmail,
  }) {
    final uuid = const Uuid();
    final now = DateTime.now();
    final age = now.year - birthDate.year;
    
    AgeGroup ageGroup;
    if (age <= 5) {
      ageGroup = AgeGroup.preschool;
    } else if (age <= 6) {
      ageGroup = AgeGroup.kindergarten;
    } else if (age <= 7) {
      ageGroup = AgeGroup.earlyElementary;
    } else {
      ageGroup = AgeGroup.elementary;
    }

    return User(
      id: uuid.v4(),
      name: name,
      ageGroup: ageGroup,
      birthDate: birthDate,
      createdAt: now,
      preferences: UserPreferences.defaultPreferences(),
      progress: LearningProgress.initial(),
      creatureIds: [],
      parentEmail: parentEmail,
      isParentVerified: parentEmail != null,
    );
  }

  int get age {
    final now = DateTime.now();
    int age = now.year - birthDate.year;
    if (now.month < birthDate.month || 
        (now.month == birthDate.month && now.day < birthDate.day)) {
      age--;
    }
    return age;
  }

  User copyWith({
    String? name,
    AgeGroup? ageGroup,
    DateTime? birthDate,
    UserPreferences? preferences,
    LearningProgress? progress,
    List<String>? creatureIds,
    String? parentEmail,
    bool? isParentVerified,
  }) {
    return User(
      id: id,
      name: name ?? this.name,
      ageGroup: ageGroup ?? this.ageGroup,
      birthDate: birthDate ?? this.birthDate,
      createdAt: createdAt,
      preferences: preferences ?? this.preferences,
      progress: progress ?? this.progress,
      creatureIds: creatureIds ?? this.creatureIds,
      parentEmail: parentEmail ?? this.parentEmail,
      isParentVerified: isParentVerified ?? this.isParentVerified,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'ageGroup': ageGroup.name,
      'birthDate': birthDate.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'preferences': preferences.toJson(),
      'progress': progress.toJson(),
      'creatureIds': creatureIds,
      'parentEmail': parentEmail,
      'isParentVerified': isParentVerified,
    };
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      ageGroup: AgeGroup.values.firstWhere(
        (e) => e.name == json['ageGroup'],
        orElse: () => AgeGroup.preschool,
      ),
      birthDate: DateTime.parse(json['birthDate']),
      createdAt: DateTime.parse(json['createdAt']),
      preferences: UserPreferences.fromJson(json['preferences']),
      progress: LearningProgress.fromJson(json['progress']),
      creatureIds: List<String>.from(json['creatureIds'] ?? []),
      parentEmail: json['parentEmail'],
      isParentVerified: json['isParentVerified'] ?? false,
    );
  }
}
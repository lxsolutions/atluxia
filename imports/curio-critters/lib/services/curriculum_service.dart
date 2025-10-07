import 'dart:math';
import '../models/curriculum.dart';
import '../models/assessment.dart';
import '../models/daily_quest.dart';
import '../models/user.dart';
import 'ai_content_service.dart';
import 'firebase_service.dart';

class CurriculumService {
  static final CurriculumService _instance = CurriculumService._internal();
  factory CurriculumService() => _instance;
  CurriculumService._internal();

  final AIContentService _aiContentService = AIContentService();
  final FirebaseService _firebaseService = FirebaseService();
  final Random _random = Random();

  // Standards and Curriculum Management
  Future<List<LearningStandard>> getStandardsForGrade(GradeLevel gradeLevel) async {
    try {
      // In a real implementation, this would fetch from a comprehensive standards database
      return _getBuiltInStandards(gradeLevel);
    } catch (e) {
      print('Error loading standards: $e');
      return [];
    }
  }

  Future<CurriculumScope> createYearlyScope({
    required User user,
    required DateTime schoolYearStart,
    StandardsFramework framework = StandardsFramework.commonCore,
  }) async {
    try {
      final gradeLevel = _determineGradeLevel(user.age);
      final standards = await getStandardsForGrade(gradeLevel);
      
      final scope = CurriculumScope.createYearlyScope(
        name: '${user.name}\'s ${gradeLevel.name} Curriculum',
        gradeLevel: gradeLevel,
        schoolYearStart: schoolYearStart,
      );

      // Populate with actual standards
      final subjectStandards = <Subject, List<String>>{};
      for (final standard in standards) {
        if (!subjectStandards.containsKey(standard.subject)) {
          subjectStandards[standard.subject] = [];
        }
        subjectStandards[standard.subject]!.add(standard.id);
      }

      final updatedScope = CurriculumScope(
        id: scope.id,
        name: scope.name,
        description: scope.description,
        gradeLevel: scope.gradeLevel,
        subjectStandards: subjectStandards,
        weeklyHours: scope.weeklyHours,
        requiredStandardIds: standards.where((s) => s.isRequired).map((s) => s.id).toList(),
        optionalStandardIds: standards.where((s) => !s.isRequired).map((s) => s.id).toList(),
        startDate: scope.startDate,
        endDate: scope.endDate,
        isActive: scope.isActive,
      );

      await _firebaseService.saveCurriculumScope(updatedScope);
      return updatedScope;
    } catch (e) {
      print('Error creating yearly scope: $e');
      throw Exception('Failed to create curriculum scope');
    }
  }

  // Daily Quest Generation
  Future<DailyQuestPlan> generateDailyQuests({
    required User user,
    required DateTime date,
    CurriculumScope? scope,
  }) async {
    try {
      final gradeLevel = user.progress.currentGradeLevel;
      final standards = await getStandardsForGrade(gradeLevel);
      
      // Analyze user's progress to determine what to focus on
      final questPlan = await _createAdaptiveQuestPlan(user, date, standards);
      
      await _firebaseService.saveDailyQuestPlan(questPlan);
      return questPlan;
    } catch (e) {
      print('Error generating daily quests: $e');
      throw Exception('Failed to generate daily quests');
    }
  }

  Future<DailyQuestPlan> _createAdaptiveQuestPlan(
    User user,
    DateTime date,
    List<LearningStandard> standards,
  ) async {
    final quests = <DailyQuest>[];
    final subjectMinutes = <Subject, int>{};

    // Determine daily learning goals based on user's progress and needs
    final subjectPriorities = _analyzeSubjectPriorities(user);
    
    for (final subject in Subject.values) {
      if (subject == Subject.socialStudies && user.age < 6) continue; // Skip for younger kids
      
      final priority = subjectPriorities[subject] ?? QuestPriority.medium;
      final minutes = _getSubjectMinutes(subject, user.age, priority);
      subjectMinutes[subject] = minutes;

      // Generate quests for this subject
      final subjectQuests = await _generateSubjectQuests(
        user: user,
        subject: subject,
        targetMinutes: minutes,
        standards: standards.where((s) => s.subject == subject).toList(),
        date: date,
      );
      
      quests.addAll(subjectQuests);
    }

    return DailyQuestPlan.create(
      userId: user.id,
      date: date,
      questIds: quests.map((q) => q.id).toList(),
      subjectMinutes: subjectMinutes,
    );
  }

  Future<List<DailyQuest>> _generateSubjectQuests({
    required User user,
    required Subject subject,
    required int targetMinutes,
    required List<LearningStandard> standards,
    required DateTime date,
  }) async {
    final quests = <DailyQuest>[];
    int remainingMinutes = targetMinutes;

    // Determine quest mix based on subject and user progress
    final questMix = _getQuestMix(subject, user);
    
    for (final questType in questMix.keys) {
      final percentage = questMix[questType]!;
      final questMinutes = (targetMinutes * percentage).round();
      
      if (questMinutes > 0 && remainingMinutes > 0) {
        final quest = await _createQuest(
          user: user,
          subject: subject,
          type: questType,
          targetMinutes: questMinutes,
          standards: standards,
          date: date,
        );
        
        if (quest != null) {
          quests.add(quest);
          remainingMinutes -= quest.estimatedMinutes;
        }
      }
    }

    return quests;
  }

  Future<DailyQuest?> _createQuest({
    required User user,
    required Subject subject,
    required QuestType type,
    required int targetMinutes,
    required List<LearningStandard> standards,
    required DateTime date,
  }) async {
    try {
      switch (type) {
        case QuestType.lesson:
          return await _createLessonQuest(user, subject, targetMinutes, standards);
        case QuestType.practice:
          return await _createPracticeQuest(user, subject, targetMinutes, standards);
        case QuestType.assessment:
          return await _createAssessmentQuest(user, subject, targetMinutes, standards);
        case QuestType.review:
          return await _createReviewQuest(user, subject, targetMinutes);
        case QuestType.creative:
          return await _createCreativeQuest(user, subject, targetMinutes);
        case QuestType.reading:
          return await _createReadingQuest(user, subject, targetMinutes);
        case QuestType.exploration:
          return await _createExplorationQuest(user, subject, targetMinutes, standards);
      }
    } catch (e) {
      print('Error creating quest: $e');
      return null;
    }
  }

  Future<DailyQuest?> _createLessonQuest(
    User user,
    Subject subject,
    int targetMinutes,
    List<LearningStandard> standards,
  ) async {
    // Find next standard to work on
    final nextStandard = _findNextStandard(user, standards);
    if (nextStandard == null) return null;

    // Generate AI lesson
    final lesson = await _aiContentService.generateLesson(
      subject: subject,
      gradeLevel: user.progress.currentGradeLevel,
      standardId: nextStandard.id,
      user: user,
      targetMinutes: targetMinutes,
    );

    if (lesson == null) return null;

    return DailyQuest.create(
      title: 'Learn: ${lesson.title}',
      description: lesson.description,
      type: QuestType.lesson,
      subject: subject,
      priority: QuestPriority.high,
      objectiveIds: lesson.objectiveIds,
      lessonId: lesson.id,
      estimatedMinutes: lesson.estimatedMinutes,
    );
  }

  Future<DailyQuest?> _createAssessmentQuest(
    User user,
    Subject subject,
    int targetMinutes,
    List<LearningStandard> standards,
  ) async {
    // Find standards ready for assessment
    final readyStandards = _findStandardsReadyForAssessment(user, standards);
    if (readyStandards.isEmpty) return null;

    final standard = readyStandards[_random.nextInt(readyStandards.length)];
    
    // Generate AI assessment
    final assessment = await _aiContentService.generateAssessment(
      subject: subject,
      gradeLevel: user.progress.currentGradeLevel,
      standardIds: [standard.id],
      user: user,
      assessmentType: AssessmentType.mastery,
    );

    if (assessment == null) return null;

    return DailyQuest.create(
      title: 'Assessment: ${assessment.title}',
      description: assessment.description,
      type: QuestType.assessment,
      subject: subject,
      priority: QuestPriority.high,
      objectiveIds: [],
      assessmentId: assessment.id,
      estimatedMinutes: targetMinutes,
    );
  }

  Future<DailyQuest?> _createPracticeQuest(
    User user,
    Subject subject,
    int targetMinutes,
    List<LearningStandard> standards,
  ) async {
    // Find standards that need practice
    final practiceStandards = _findStandardsNeedingPractice(user, standards);
    if (practiceStandards.isEmpty) return null;

    final standard = practiceStandards[_random.nextInt(practiceStandards.length)];

    return DailyQuest.create(
      title: 'Practice: ${_getSubjectDisplayName(subject)}',
      description: 'Practice ${standard.title.toLowerCase()} with fun activities',
      type: QuestType.practice,
      subject: subject,
      priority: QuestPriority.medium,
      objectiveIds: [],
      estimatedMinutes: targetMinutes,
    );
  }

  Future<DailyQuest?> _createReviewQuest(
    User user,
    Subject subject,
    int targetMinutes,
  ) async {
    return DailyQuest.create(
      title: 'Review: ${_getSubjectDisplayName(subject)}',
      description: 'Review what you\'ve learned in ${_getSubjectDisplayName(subject)}',
      type: QuestType.review,
      subject: subject,
      priority: QuestPriority.low,
      objectiveIds: [],
      estimatedMinutes: targetMinutes,
    );
  }

  Future<DailyQuest?> _createCreativeQuest(
    User user,
    Subject subject,
    int targetMinutes,
  ) async {
    final activities = _getCreativeActivities(subject);
    final activity = activities[_random.nextInt(activities.length)];

    return DailyQuest.create(
      title: 'Create: $activity',
      description: 'Express your creativity with this fun ${_getSubjectDisplayName(subject)} project',
      type: QuestType.creative,
      subject: subject,
      priority: QuestPriority.medium,
      objectiveIds: [],
      estimatedMinutes: targetMinutes,
    );
  }

  Future<DailyQuest?> _createReadingQuest(
    User user,
    Subject subject,
    int targetMinutes,
  ) async {
    return DailyQuest.create(
      title: 'Reading Time',
      description: 'Enjoy some independent reading time',
      type: QuestType.reading,
      subject: Subject.reading,
      priority: QuestPriority.medium,
      objectiveIds: [],
      estimatedMinutes: targetMinutes,
    );
  }

  Future<DailyQuest?> _createExplorationQuest(
    User user,
    Subject subject,
    int targetMinutes,
    List<LearningStandard> standards,
  ) async {
    final explorations = _getExplorationActivities(subject);
    final exploration = explorations[_random.nextInt(explorations.length)];

    return DailyQuest.create(
      title: 'Explore: $exploration',
      description: 'Discover something new in ${_getSubjectDisplayName(subject)}',
      type: QuestType.exploration,
      subject: subject,
      priority: QuestPriority.medium,
      objectiveIds: [],
      estimatedMinutes: targetMinutes,
    );
  }

  // Progress Analysis and Adaptive Learning
  Map<Subject, QuestPriority> _analyzeSubjectPriorities(User user) {
    final priorities = <Subject, QuestPriority>{};
    
    for (final subject in Subject.values) {
      final subjectName = subject.name;
      final progress = user.progress.subjectProgressPercentage[subjectName] ?? 0.0;
      final lastAssessed = user.progress.subjectLastAssessed[subjectName];
      final daysSinceAssessment = lastAssessed != null 
          ? DateTime.now().difference(lastAssessed).inDays 
          : 999;

      // Determine priority based on progress and recency
      if (progress < 0.3 || daysSinceAssessment > 7) {
        priorities[subject] = QuestPriority.high;
      } else if (progress < 0.6 || daysSinceAssessment > 3) {
        priorities[subject] = QuestPriority.medium;
      } else {
        priorities[subject] = QuestPriority.low;
      }
    }

    return priorities;
  }

  LearningStandard? _findNextStandard(User user, List<LearningStandard> standards) {
    // Find standards that haven't been mastered yet
    final unmastered = standards.where((s) {
      final mastery = user.progress.standardMastery[s.id] ?? MasteryLevel.notStarted;
      return mastery != MasteryLevel.mastered;
    }).toList();

    if (unmastered.isEmpty) return null;

    // Sort by prerequisites and difficulty
    unmastered.sort((a, b) {
      final aMastery = user.progress.standardMastery[a.id] ?? MasteryLevel.notStarted;
      final bMastery = user.progress.standardMastery[b.id] ?? MasteryLevel.notStarted;
      
      // Prioritize standards that are in progress
      if (aMastery == MasteryLevel.developing && bMastery != MasteryLevel.developing) {
        return -1;
      }
      if (bMastery == MasteryLevel.developing && aMastery != MasteryLevel.developing) {
        return 1;
      }
      
      return a.estimatedHours.compareTo(b.estimatedHours);
    });

    return unmastered.first;
  }

  List<LearningStandard> _findStandardsReadyForAssessment(User user, List<LearningStandard> standards) {
    return standards.where((s) {
      final mastery = user.progress.standardMastery[s.id] ?? MasteryLevel.notStarted;
      return mastery == MasteryLevel.developing || mastery == MasteryLevel.proficient;
    }).toList();
  }

  List<LearningStandard> _findStandardsNeedingPractice(User user, List<LearningStandard> standards) {
    return standards.where((s) {
      final mastery = user.progress.standardMastery[s.id] ?? MasteryLevel.notStarted;
      return mastery == MasteryLevel.emerging || mastery == MasteryLevel.developing;
    }).toList();
  }

  // Helper Methods
  GradeLevel _determineGradeLevel(int age) {
    switch (age) {
      case 4:
        return GradeLevel.preK;
      case 5:
        return GradeLevel.kindergarten;
      case 6:
        return GradeLevel.grade1;
      case 7:
        return GradeLevel.grade2;
      case 8:
        return GradeLevel.grade3;
      case 9:
        return GradeLevel.grade4;
      default:
        return GradeLevel.kindergarten;
    }
  }

  Map<QuestType, double> _getQuestMix(Subject subject, User user) {
    // Default quest distribution
    switch (subject) {
      case Subject.math:
        return {
          QuestType.lesson: 0.4,
          QuestType.practice: 0.3,
          QuestType.assessment: 0.2,
          QuestType.review: 0.1,
        };
      case Subject.reading:
        return {
          QuestType.lesson: 0.3,
          QuestType.practice: 0.2,
          QuestType.reading: 0.3,
          QuestType.assessment: 0.1,
          QuestType.review: 0.1,
        };
      case Subject.writing:
        return {
          QuestType.lesson: 0.3,
          QuestType.practice: 0.4,
          QuestType.creative: 0.2,
          QuestType.assessment: 0.1,
        };
      case Subject.science:
        return {
          QuestType.lesson: 0.3,
          QuestType.exploration: 0.3,
          QuestType.practice: 0.2,
          QuestType.assessment: 0.2,
        };
      case Subject.art:
        return {
          QuestType.creative: 0.6,
          QuestType.lesson: 0.2,
          QuestType.exploration: 0.2,
        };
      case Subject.socialStudies:
        return {
          QuestType.lesson: 0.4,
          QuestType.exploration: 0.3,
          QuestType.creative: 0.2,
          QuestType.assessment: 0.1,
        };
    }
  }

  int _getSubjectMinutes(Subject subject, int age, QuestPriority priority) {
    int baseMinutes;
    
    switch (subject) {
      case Subject.math:
        baseMinutes = age < 6 ? 20 : 30;
        break;
      case Subject.reading:
        baseMinutes = age < 6 ? 25 : 35;
        break;
      case Subject.writing:
        baseMinutes = age < 6 ? 15 : 25;
        break;
      case Subject.science:
        baseMinutes = age < 6 ? 20 : 30;
        break;
      case Subject.art:
        baseMinutes = 20;
        break;
      case Subject.socialStudies:
        baseMinutes = age < 6 ? 0 : 15;
        break;
    }

    // Adjust based on priority
    switch (priority) {
      case QuestPriority.low:
        return (baseMinutes * 0.7).round();
      case QuestPriority.medium:
        return baseMinutes;
      case QuestPriority.high:
        return (baseMinutes * 1.3).round();
      case QuestPriority.critical:
        return (baseMinutes * 1.5).round();
    }
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

  List<String> _getCreativeActivities(Subject subject) {
    switch (subject) {
      case Subject.art:
        return ['Draw a picture', 'Make a collage', 'Paint with watercolors', 'Create a sculpture'];
      case Subject.writing:
        return ['Write a story', 'Create a comic', 'Write a poem', 'Make a journal entry'];
      case Subject.science:
        return ['Design an experiment', 'Build a model', 'Create a nature journal', 'Make observations'];
      case Subject.math:
        return ['Create patterns', 'Build with shapes', 'Make a graph', 'Design a game'];
      default:
        return ['Create something fun!'];
    }
  }

  List<String> _getExplorationActivities(Subject subject) {
    switch (subject) {
      case Subject.science:
        return ['Nature walk', 'Kitchen science', 'Weather watching', 'Animal observation'];
      case Subject.math:
        return ['Number hunt', 'Shape search', 'Measurement exploration', 'Pattern finding'];
      case Subject.reading:
        return ['Library visit', 'Story exploration', 'Word games', 'Reading adventure'];
      default:
        return ['Explore and discover!'];
    }
  }

  // Built-in standards (simplified for demo)
  List<LearningStandard> _getBuiltInStandards(GradeLevel gradeLevel) {
    final standards = <LearningStandard>[];
    final uuid = const Uuid();

    // Math standards
    if (gradeLevel == GradeLevel.kindergarten) {
      standards.addAll([
        LearningStandard(
          id: uuid.v4(),
          code: 'K.CC.A.1',
          title: 'Count to 100 by ones and tens',
          description: 'Count to 100 by ones and by tens',
          subject: Subject.math,
          gradeLevel: gradeLevel,
          framework: StandardsFramework.commonCore,
          prerequisites: [],
          keywords: ['counting', 'numbers', 'sequence'],
          estimatedHours: 10,
          isRequired: true,
        ),
        LearningStandard(
          id: uuid.v4(),
          code: 'K.CC.B.4',
          title: 'Understand number relationships',
          description: 'Understand the relationship between numbers and quantities',
          subject: Subject.math,
          gradeLevel: gradeLevel,
          framework: StandardsFramework.commonCore,
          prerequisites: [],
          keywords: ['numbers', 'quantity', 'counting'],
          estimatedHours: 15,
          isRequired: true,
        ),
      ]);
    }

    // Reading standards
    standards.addAll([
      LearningStandard(
        id: uuid.v4(),
        code: 'K.RF.1',
        title: 'Print concepts',
        description: 'Demonstrate understanding of the organization and basic features of print',
        subject: Subject.reading,
        gradeLevel: gradeLevel,
        framework: StandardsFramework.commonCore,
        prerequisites: [],
        keywords: ['print', 'books', 'reading'],
        estimatedHours: 8,
        isRequired: true,
      ),
    ]);

    return standards;
  }
}
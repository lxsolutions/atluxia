import 'dart:typed_data';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import 'package:firebase_storage/firebase_storage.dart';
import '../models/user.dart' as app_user;
import '../models/creature.dart';
import '../models/mini_game.dart';
import '../models/learning_content.dart';
import '../models/curriculum.dart';
import '../models/assessment.dart';
import '../models/daily_quest.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final auth.FirebaseAuth _auth = auth.FirebaseAuth.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;

  // Collections
  static const String usersCollection = 'users';
  static const String creaturesCollection = 'creatures';
  static const String gamesCollection = 'games';
  static const String gameSessionsCollection = 'game_sessions';
  static const String learningContentCollection = 'learning_content';
  static const String curriculumScopesCollection = 'curriculum_scopes';
  static const String lessonsCollection = 'lessons';
  static const String assessmentsCollection = 'assessments';
  static const String assessmentAttemptsCollection = 'assessment_attempts';
  static const String dailyQuestsCollection = 'daily_quests';
  static const String questProgressCollection = 'quest_progress';
  static const String dailyQuestPlansCollection = 'daily_quest_plans';
  static const String learningStandardsCollection = 'learning_standards';

  // Authentication
  Future<String?> signInAnonymously() async {
    try {
      final credential = await _auth.signInAnonymously();
      return credential.user?.uid;
    } catch (e) {
      print('Error signing in anonymously: $e');
      return null;
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  String? get currentUserId => _auth.currentUser?.uid;

  // User Management
  Future<bool> createUser(app_user.User user) async {
    try {
      await _firestore
          .collection(usersCollection)
          .doc(user.id)
          .set(user.toJson());
      return true;
    } catch (e) {
      print('Error creating user: $e');
      return false;
    }
  }

  Future<app_user.User?> getUser(String userId) async {
    try {
      final doc = await _firestore
          .collection(usersCollection)
          .doc(userId)
          .get();
      
      if (doc.exists) {
        return app_user.User.fromJson(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Error getting user: $e');
      return null;
    }
  }

  Future<bool> updateUser(app_user.User user) async {
    try {
      await _firestore
          .collection(usersCollection)
          .doc(user.id)
          .update(user.toJson());
      return true;
    } catch (e) {
      print('Error updating user: $e');
      return false;
    }
  }

  Stream<app_user.User?> watchUser(String userId) {
    return _firestore
        .collection(usersCollection)
        .doc(userId)
        .snapshots()
        .map((doc) {
      if (doc.exists) {
        return app_user.User.fromJson(doc.data()!);
      }
      return null;
    });
  }

  // Creature Management
  Future<bool> createCreature(Creature creature) async {
    try {
      await _firestore
          .collection(creaturesCollection)
          .doc(creature.id)
          .set(creature.toJson());
      return true;
    } catch (e) {
      print('Error creating creature: $e');
      return false;
    }
  }

  Future<Creature?> getCreature(String creatureId) async {
    try {
      final doc = await _firestore
          .collection(creaturesCollection)
          .doc(creatureId)
          .get();
      
      if (doc.exists) {
        return Creature.fromJson(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Error getting creature: $e');
      return null;
    }
  }

  Future<List<Creature>> getUserCreatures(String userId) async {
    try {
      final user = await getUser(userId);
      if (user == null) return [];

      final List<Creature> creatures = [];
      for (final creatureId in user.creatureIds) {
        final creature = await getCreature(creatureId);
        if (creature != null) {
          creatures.add(creature);
        }
      }
      return creatures;
    } catch (e) {
      print('Error getting user creatures: $e');
      return [];
    }
  }

  Future<bool> updateCreature(Creature creature) async {
    try {
      await _firestore
          .collection(creaturesCollection)
          .doc(creature.id)
          .update(creature.toJson());
      return true;
    } catch (e) {
      print('Error updating creature: $e');
      return false;
    }
  }

  Stream<Creature?> watchCreature(String creatureId) {
    return _firestore
        .collection(creaturesCollection)
        .doc(creatureId)
        .snapshots()
        .map((doc) {
      if (doc.exists) {
        return Creature.fromJson(doc.data()!);
      }
      return null;
    });
  }

  // Game Management
  Future<bool> saveGame(MiniGame game) async {
    try {
      await _firestore
          .collection(gamesCollection)
          .doc(game.id)
          .set(game.toJson());
      return true;
    } catch (e) {
      print('Error saving game: $e');
      return false;
    }
  }

  Future<MiniGame?> getGame(String gameId) async {
    try {
      final doc = await _firestore
          .collection(gamesCollection)
          .doc(gameId)
          .get();
      
      if (doc.exists) {
        return MiniGame.fromJson(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Error getting game: $e');
      return null;
    }
  }

  Future<List<MiniGame>> getGamesForUser(app_user.User user) async {
    try {
      final query = await _firestore
          .collection(gamesCollection)
          .where('targetAge', isLessThanOrEqualTo: user.age + 1)
          .where('targetAge', isGreaterThanOrEqualTo: user.age - 1)
          .get();

      return query.docs
          .map((doc) => MiniGame.fromJson(doc.data()))
          .toList();
    } catch (e) {
      print('Error getting games for user: $e');
      return [];
    }
  }

  // Game Session Management
  Future<bool> saveGameSession(GameSession session) async {
    try {
      await _firestore
          .collection(gameSessionsCollection)
          .doc(session.id)
          .set(session.toJson());
      return true;
    } catch (e) {
      print('Error saving game session: $e');
      return false;
    }
  }

  Future<GameSession?> getGameSession(String sessionId) async {
    try {
      final doc = await _firestore
          .collection(gameSessionsCollection)
          .doc(sessionId)
          .get();
      
      if (doc.exists) {
        return GameSession.fromJson(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Error getting game session: $e');
      return null;
    }
  }

  Future<List<GameSession>> getUserGameSessions(String userId, {int limit = 50}) async {
    try {
      final query = await _firestore
          .collection(gameSessionsCollection)
          .where('userId', isEqualTo: userId)
          .orderBy('startedAt', descending: true)
          .limit(limit)
          .get();

      return query.docs
          .map((doc) => GameSession.fromJson(doc.data()))
          .toList();
    } catch (e) {
      print('Error getting user game sessions: $e');
      return [];
    }
  }

  // Learning Content Management
  Future<bool> saveLearningContent(LearningContent content) async {
    try {
      await _firestore
          .collection(learningContentCollection)
          .doc(content.id)
          .set(content.toJson());
      return true;
    } catch (e) {
      print('Error saving learning content: $e');
      return false;
    }
  }

  Future<LearningContent?> getLearningContent(String contentId) async {
    try {
      final doc = await _firestore
          .collection(learningContentCollection)
          .doc(contentId)
          .get();
      
      if (doc.exists) {
        return LearningContent.fromJson(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Error getting learning content: $e');
      return null;
    }
  }

  Future<List<LearningContent>> getContentForSubject(
    String subject, 
    int targetAge, 
    {int limit = 20}
  ) async {
    try {
      final query = await _firestore
          .collection(learningContentCollection)
          .where('subject', isEqualTo: subject)
          .where('targetAge', isLessThanOrEqualTo: targetAge + 1)
          .where('targetAge', isGreaterThanOrEqualTo: targetAge - 1)
          .orderBy('createdAt', descending: true)
          .limit(limit)
          .get();

      return query.docs
          .map((doc) => LearningContent.fromJson(doc.data()))
          .toList();
    } catch (e) {
      print('Error getting content for subject: $e');
      return [];
    }
  }

  // Analytics and Progress Tracking
  Future<Map<String, dynamic>> getUserAnalytics(String userId) async {
    try {
      final sessions = await getUserGameSessions(userId, limit: 100);
      final user = await getUser(userId);
      
      if (user == null) return {};

      // Calculate analytics
      final totalGamesPlayed = sessions.length;
      final totalTimeSpent = sessions.fold<int>(
        0, 
        (sum, session) => sum + session.totalTimeSpent,
      );
      
      final subjectStats = <String, Map<String, dynamic>>{};
      final gameTypeStats = <String, int>{};
      
      for (final session in sessions) {
        // This would need to be enhanced with actual game type data
        gameTypeStats['total'] = (gameTypeStats['total'] ?? 0) + 1;
      }

      final averageAccuracy = sessions.isEmpty ? 0.0 : 
          sessions.fold<double>(0, (sum, session) => sum + session.accuracyPercentage) / sessions.length;

      return {
        'totalGamesPlayed': totalGamesPlayed,
        'totalTimeSpent': totalTimeSpent,
        'averageAccuracy': averageAccuracy,
        'subjectStats': subjectStats,
        'gameTypeStats': gameTypeStats,
        'lastPlayedDate': sessions.isNotEmpty ? sessions.first.startedAt.toIso8601String() : null,
        'streakDays': _calculateStreakDays(sessions),
      };
    } catch (e) {
      print('Error getting user analytics: $e');
      return {};
    }
  }

  int _calculateStreakDays(List<GameSession> sessions) {
    if (sessions.isEmpty) return 0;
    
    final sortedSessions = sessions..sort((a, b) => b.startedAt.compareTo(a.startedAt));
    final today = DateTime.now();
    int streak = 0;
    
    for (int i = 0; i < sortedSessions.length; i++) {
      final sessionDate = sortedSessions[i].startedAt;
      final daysDifference = today.difference(sessionDate).inDays;
      
      if (daysDifference == streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // File Storage
  Future<String?> uploadImage(String path, List<int> imageData) async {
    try {
      final ref = _storage.ref().child(path);
      final uploadTask = ref.putData(Uint8List.fromList(imageData));
      final snapshot = await uploadTask;
      return await snapshot.ref.getDownloadURL();
    } catch (e) {
      print('Error uploading image: $e');
      return null;
    }
  }

  Future<String?> uploadAudio(String path, List<int> audioData) async {
    try {
      final ref = _storage.ref().child(path);
      final uploadTask = ref.putData(Uint8List.fromList(audioData));
      final snapshot = await uploadTask;
      return await snapshot.ref.getDownloadURL();
    } catch (e) {
      print('Error uploading audio: $e');
      return null;
    }
  }

  // Curriculum Management
  Future<bool> saveCurriculumScope(CurriculumScope scope) async {
    try {
      await _firestore
          .collection(curriculumScopesCollection)
          .doc(scope.id)
          .set(scope.toJson());
      return true;
    } catch (e) {
      print('Error saving curriculum scope: $e');
      return false;
    }
  }

  Future<CurriculumScope?> getCurriculumScope(String scopeId) async {
    try {
      final doc = await _firestore
          .collection(curriculumScopesCollection)
          .doc(scopeId)
          .get();
      
      if (doc.exists) {
        return CurriculumScope.fromJson(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Error getting curriculum scope: $e');
      return null;
    }
  }

  // Lesson Management
  Future<bool> saveLesson(Lesson lesson) async {
    try {
      await _firestore
          .collection(lessonsCollection)
          .doc(lesson.id)
          .set(lesson.toJson());
      return true;
    } catch (e) {
      print('Error saving lesson: $e');
      return false;
    }
  }

  Future<Lesson?> getLesson(String lessonId) async {
    try {
      final doc = await _firestore
          .collection(lessonsCollection)
          .doc(lessonId)
          .get();
      
      if (doc.exists) {
        return Lesson.fromJson(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Error getting lesson: $e');
      return null;
    }
  }

  // Assessment Management
  Future<bool> saveAssessment(Assessment assessment) async {
    try {
      await _firestore
          .collection(assessmentsCollection)
          .doc(assessment.id)
          .set(assessment.toJson());
      return true;
    } catch (e) {
      print('Error saving assessment: $e');
      return false;
    }
  }

  Future<Assessment?> getAssessment(String assessmentId) async {
    try {
      final doc = await _firestore
          .collection(assessmentsCollection)
          .doc(assessmentId)
          .get();
      
      if (doc.exists) {
        return Assessment.fromJson(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Error getting assessment: $e');
      return null;
    }
  }

  Future<bool> saveAssessmentAttempt(AssessmentAttempt attempt) async {
    try {
      await _firestore
          .collection(assessmentAttemptsCollection)
          .doc(attempt.id)
          .set(attempt.toJson());
      return true;
    } catch (e) {
      print('Error saving assessment attempt: $e');
      return false;
    }
  }

  Future<List<AssessmentAttempt>> getUserAssessmentAttempts(String userId, {int limit = 50}) async {
    try {
      final query = await _firestore
          .collection(assessmentAttemptsCollection)
          .where('userId', isEqualTo: userId)
          .orderBy('startedAt', descending: true)
          .limit(limit)
          .get();

      return query.docs
          .map((doc) => AssessmentAttempt.fromJson(doc.data()))
          .toList();
    } catch (e) {
      print('Error getting user assessment attempts: $e');
      return [];
    }
  }

  // Daily Quest Management
  Future<bool> saveDailyQuest(DailyQuest quest) async {
    try {
      await _firestore
          .collection(dailyQuestsCollection)
          .doc(quest.id)
          .set(quest.toJson());
      return true;
    } catch (e) {
      print('Error saving daily quest: $e');
      return false;
    }
  }

  Future<DailyQuest?> getDailyQuest(String questId) async {
    try {
      final doc = await _firestore
          .collection(dailyQuestsCollection)
          .doc(questId)
          .get();
      
      if (doc.exists) {
        return DailyQuest.fromJson(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Error getting daily quest: $e');
      return null;
    }
  }

  Future<bool> saveDailyQuestPlan(DailyQuestPlan plan) async {
    try {
      await _firestore
          .collection(dailyQuestPlansCollection)
          .doc(plan.id)
          .set(plan.toJson());
      return true;
    } catch (e) {
      print('Error saving daily quest plan: $e');
      return false;
    }
  }

  Future<DailyQuestPlan?> getDailyQuestPlan(String userId, DateTime date) async {
    try {
      final dateString = DateTime(date.year, date.month, date.day).toIso8601String();
      final query = await _firestore
          .collection(dailyQuestPlansCollection)
          .where('userId', isEqualTo: userId)
          .where('date', isEqualTo: dateString)
          .limit(1)
          .get();

      if (query.docs.isNotEmpty) {
        return DailyQuestPlan.fromJson(query.docs.first.data());
      }
      return null;
    } catch (e) {
      print('Error getting daily quest plan: $e');
      return null;
    }
  }

  Future<bool> saveQuestProgress(QuestProgress progress) async {
    try {
      await _firestore
          .collection(questProgressCollection)
          .doc(progress.id)
          .set(progress.toJson());
      return true;
    } catch (e) {
      print('Error saving quest progress: $e');
      return false;
    }
  }

  Future<List<QuestProgress>> getUserQuestProgress(String userId, DateTime date) async {
    try {
      final startOfDay = DateTime(date.year, date.month, date.day);
      final endOfDay = startOfDay.add(const Duration(days: 1));

      final query = await _firestore
          .collection(questProgressCollection)
          .where('userId', isEqualTo: userId)
          .where('startedAt', isGreaterThanOrEqualTo: startOfDay.toIso8601String())
          .where('startedAt', isLessThan: endOfDay.toIso8601String())
          .get();

      return query.docs
          .map((doc) => QuestProgress.fromJson(doc.data()))
          .toList();
    } catch (e) {
      print('Error getting user quest progress: $e');
      return [];
    }
  }

  // Learning Standards Management
  Future<bool> saveLearningStandard(LearningStandard standard) async {
    try {
      await _firestore
          .collection(learningStandardsCollection)
          .doc(standard.id)
          .set(standard.toJson());
      return true;
    } catch (e) {
      print('Error saving learning standard: $e');
      return false;
    }
  }

  Future<List<LearningStandard>> getLearningStandards({
    GradeLevel? gradeLevel,
    Subject? subject,
    StandardsFramework? framework,
  }) async {
    try {
      Query query = _firestore.collection(learningStandardsCollection);
      
      if (gradeLevel != null) {
        query = query.where('gradeLevel', isEqualTo: gradeLevel.name);
      }
      if (subject != null) {
        query = query.where('subject', isEqualTo: subject.name);
      }
      if (framework != null) {
        query = query.where('framework', isEqualTo: framework.name);
      }

      final result = await query.get();
      return result.docs
          .map((doc) => LearningStandard.fromJson(doc.data() as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error getting learning standards: $e');
      return [];
    }
  }

  // Comprehensive Progress Tracking
  Future<Map<String, dynamic>> getComprehensiveUserAnalytics(String userId) async {
    try {
      final user = await getUser(userId);
      if (user == null) return {};

      final sessions = await getUserGameSessions(userId, limit: 100);
      final assessmentAttempts = await getUserAssessmentAttempts(userId);
      
      // Calculate comprehensive analytics
      final totalLearningTime = user.progress.totalTimeSpent;
      final subjectBreakdown = <String, Map<String, dynamic>>{};
      
      for (final subject in Subject.values) {
        final subjectName = subject.name;
        final subjectHours = user.progress.subjectHours[subjectName] ?? 0;
        final subjectProgress = user.progress.subjectProgressPercentage[subjectName] ?? 0.0;
        final completedLessons = user.progress.completedLessons[subjectName]?.length ?? 0;
        final completedAssessments = user.progress.completedAssessments[subjectName]?.length ?? 0;
        
        subjectBreakdown[subjectName] = {
          'hoursSpent': subjectHours,
          'progressPercentage': subjectProgress,
          'lessonsCompleted': completedLessons,
          'assessmentsCompleted': completedAssessments,
          'currentLevel': user.progress.subjectLevels[subjectName] ?? 1,
        };
      }

      return {
        'totalLearningTime': totalLearningTime,
        'currentGradeLevel': user.progress.currentGradeLevel.name,
        'schoolYearStart': user.progress.schoolYearStart.toIso8601String(),
        'subjectBreakdown': subjectBreakdown,
        'totalAchievements': user.progress.achievements.length,
        'standardsMastery': user.progress.standardMastery.length,
        'weeklyGoalCompletion': _calculateWeeklyGoalCompletion(user),
        'learningStreak': _calculateLearningStreak(sessions),
      };
    } catch (e) {
      print('Error getting comprehensive user analytics: $e');
      return {};
    }
  }

  double _calculateWeeklyGoalCompletion(app_user.User user) {
    // Calculate based on expected weekly hours vs actual
    final now = DateTime.now();
    final weekStart = now.subtract(Duration(days: now.weekday - 1));
    
    // This would need more sophisticated calculation based on actual quest completion
    return 0.75; // Placeholder
  }

  int _calculateLearningStreak(List<GameSession> sessions) {
    if (sessions.isEmpty) return 0;
    
    final sortedSessions = sessions..sort((a, b) => b.startedAt.compareTo(a.startedAt));
    final today = DateTime.now();
    int streak = 0;
    
    for (int i = 0; i < sortedSessions.length; i++) {
      final sessionDate = sortedSessions[i].startedAt;
      final daysDifference = today.difference(sessionDate).inDays;
      
      if (daysDifference == streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Batch Operations
  Future<bool> batchUpdateUserProgress(
    String userId, 
    Map<String, dynamic> progressUpdates
  ) async {
    try {
      final batch = _firestore.batch();
      final userRef = _firestore.collection(usersCollection).doc(userId);
      
      batch.update(userRef, {'progress': progressUpdates});
      
      await batch.commit();
      return true;
    } catch (e) {
      print('Error batch updating user progress: $e');
      return false;
    }
  }
}
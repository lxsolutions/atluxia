import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/firebase_service.dart';

class UserProvider extends ChangeNotifier {
  final FirebaseService _firebaseService = FirebaseService();
  
  User? _currentUser;
  bool _isLoading = false;
  String? _error;

  // Getters
  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _currentUser != null;

  // User Authentication and Setup
  Future<bool> createUser({
    required String name,
    required DateTime birthDate,
    String? parentEmail,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      // Sign in anonymously first
      final userId = await _firebaseService.signInAnonymously();
      if (userId == null) {
        _setError('Failed to create user account');
        return false;
      }

      // Create user profile
      final user = User.create(
        name: name,
        birthDate: birthDate,
        parentEmail: parentEmail,
      );

      // Save to Firebase
      final success = await _firebaseService.createUser(user);
      if (success) {
        _currentUser = user;
        notifyListeners();
        return true;
      } else {
        _setError('Failed to save user profile');
        return false;
      }
    } catch (e) {
      _setError('Error creating user: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> loadUser(String userId) async {
    _setLoading(true);
    _clearError();

    try {
      final user = await _firebaseService.getUser(userId);
      if (user != null) {
        _currentUser = user;
        notifyListeners();
        return true;
      } else {
        _setError('User not found');
        return false;
      }
    } catch (e) {
      _setError('Error loading user: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signOut() async {
    try {
      await _firebaseService.signOut();
      _currentUser = null;
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Error signing out: $e');
    }
  }

  // User Profile Updates
  Future<bool> updateUserName(String newName) async {
    if (_currentUser == null) return false;

    try {
      final updatedUser = _currentUser!.copyWith(name: newName);
      final success = await _firebaseService.updateUser(updatedUser);
      
      if (success) {
        _currentUser = updatedUser;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _setError('Error updating name: $e');
      return false;
    }
  }

  Future<bool> updateUserPreferences(UserPreferences preferences) async {
    if (_currentUser == null) return false;

    try {
      final updatedUser = _currentUser!.copyWith(preferences: preferences);
      final success = await _firebaseService.updateUser(updatedUser);
      
      if (success) {
        _currentUser = updatedUser;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _setError('Error updating preferences: $e');
      return false;
    }
  }

  // Learning Progress Updates
  Future<bool> updateLearningProgress({
    required String subject,
    required int experienceGained,
    required double accuracy,
    required int timeSpent,
  }) async {
    if (_currentUser == null) return false;

    try {
      final currentProgress = _currentUser!.progress;
      final currentSubjectExp = currentProgress.subjectExperience[subject] ?? 0;
      final newSubjectExp = currentSubjectExp + experienceGained;
      
      // Calculate level based on experience
      final newLevel = _calculateLevel(newSubjectExp);
      
      // Update accuracy rate (running average)
      final currentAccuracy = currentProgress.accuracyRates[subject] ?? 0.0;
      final newAccuracy = currentAccuracy == 0.0 ? accuracy : (currentAccuracy + accuracy) / 2;
      
      final updatedProgress = currentProgress.copyWith(
        subjectExperience: {
          ...currentProgress.subjectExperience,
          subject: newSubjectExp,
        },
        subjectLevels: {
          ...currentProgress.subjectLevels,
          subject: newLevel,
        },
        lastPlayed: {
          ...currentProgress.lastPlayed,
          subject: DateTime.now(),
        },
        totalGamesPlayed: currentProgress.totalGamesPlayed + 1,
        totalTimeSpent: currentProgress.totalTimeSpent + timeSpent,
        accuracyRates: {
          ...currentProgress.accuracyRates,
          subject: newAccuracy,
        },
      );

      final updatedUser = _currentUser!.copyWith(progress: updatedProgress);
      final success = await _firebaseService.updateUser(updatedUser);
      
      if (success) {
        _currentUser = updatedUser;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _setError('Error updating progress: $e');
      return false;
    }
  }

  Future<bool> addAchievement(String achievement) async {
    if (_currentUser == null) return false;

    try {
      final currentAchievements = _currentUser!.progress.achievements;
      if (currentAchievements.contains(achievement)) {
        return true; // Already has this achievement
      }

      final updatedProgress = _currentUser!.progress.copyWith(
        achievements: [...currentAchievements, achievement],
      );

      final updatedUser = _currentUser!.copyWith(progress: updatedProgress);
      final success = await _firebaseService.updateUser(updatedUser);
      
      if (success) {
        _currentUser = updatedUser;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _setError('Error adding achievement: $e');
      return false;
    }
  }

  // Creature Management
  Future<bool> addCreatureToUser(String creatureId) async {
    if (_currentUser == null) return false;

    try {
      final updatedUser = _currentUser!.copyWith(
        creatureIds: [..._currentUser!.creatureIds, creatureId],
      );
      
      final success = await _firebaseService.updateUser(updatedUser);
      if (success) {
        _currentUser = updatedUser;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _setError('Error adding creature: $e');
      return false;
    }
  }

  // Analytics
  Future<Map<String, dynamic>?> getUserAnalytics() async {
    if (_currentUser == null) return null;

    try {
      return await _firebaseService.getUserAnalytics(_currentUser!.id);
    } catch (e) {
      _setError('Error loading analytics: $e');
      return null;
    }
  }

  // Helper Methods
  int _calculateLevel(int experience) {
    // Simple level calculation: every 1000 XP = 1 level
    return (experience / 1000).floor() + 1;
  }

  int getExperienceForNextLevel(String subject) {
    if (_currentUser == null) return 1000;
    
    final currentExp = _currentUser!.progress.subjectExperience[subject] ?? 0;
    final currentLevel = _currentUser!.progress.subjectLevels[subject] ?? 1;
    final nextLevelExp = currentLevel * 1000;
    
    return nextLevelExp - currentExp;
  }

  double getLevelProgress(String subject) {
    if (_currentUser == null) return 0.0;
    
    final currentExp = _currentUser!.progress.subjectExperience[subject] ?? 0;
    final currentLevel = _currentUser!.progress.subjectLevels[subject] ?? 1;
    final levelStartExp = (currentLevel - 1) * 1000;
    final levelEndExp = currentLevel * 1000;
    
    if (levelEndExp == levelStartExp) return 1.0;
    
    return (currentExp - levelStartExp) / (levelEndExp - levelStartExp);
  }

  List<String> getRecentAchievements({int limit = 5}) {
    if (_currentUser == null) return [];
    
    final achievements = _currentUser!.progress.achievements;
    return achievements.length > limit 
        ? achievements.sublist(achievements.length - limit)
        : achievements;
  }

  // Private helper methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }

  @override
  void dispose() {
    super.dispose();
  }
}
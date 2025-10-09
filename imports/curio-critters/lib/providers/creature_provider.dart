import 'package:flutter/foundation.dart';
import '../models/creature.dart';
import '../models/mini_game.dart';
import '../services/creature_service.dart';
import '../services/firebase_service.dart';

class CreatureProvider extends ChangeNotifier {
  final CreatureService _creatureService = CreatureService();
  final FirebaseService _firebaseService = FirebaseService();
  
  List<Creature> _creatures = [];
  Creature? _selectedCreature;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Creature> get creatures => _creatures;
  Creature? get selectedCreature => _selectedCreature;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasCreatures => _creatures.isNotEmpty;

  // Creature Management
  Future<bool> createCreature({
    required String name,
    required CreatureType type,
    required String userId,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final creature = await _creatureService.createCreature(
        name: name,
        type: type,
        userId: userId,
      );

      if (creature != null) {
        _creatures.add(creature);
        _selectedCreature = creature;
        notifyListeners();
        return true;
      } else {
        _setError('Failed to create creature');
        return false;
      }
    } catch (e) {
      _setError('Error creating creature: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadUserCreatures(String userId) async {
    _setLoading(true);
    _clearError();

    try {
      final creatures = await _firebaseService.getUserCreatures(userId);
      _creatures = creatures;
      
      // Select the first creature if none is selected
      if (_selectedCreature == null && creatures.isNotEmpty) {
        _selectedCreature = creatures.first;
      }
      
      notifyListeners();
    } catch (e) {
      _setError('Error loading creatures: $e');
    } finally {
      _setLoading(false);
    }
  }

  void selectCreature(String creatureId) {
    final creature = _creatures.firstWhere(
      (c) => c.id == creatureId,
      orElse: () => _creatures.first,
    );
    
    if (_selectedCreature?.id != creature.id) {
      _selectedCreature = creature;
      notifyListeners();
    }
  }

  // Creature Care Actions
  Future<bool> feedCreature([String? creatureId]) async {
    final targetCreature = creatureId != null 
        ? _creatures.firstWhere((c) => c.id == creatureId)
        : _selectedCreature;
    
    if (targetCreature == null) return false;

    try {
      final updatedCreature = await _creatureService.feedCreature(targetCreature.id);
      if (updatedCreature != null) {
        _updateCreatureInList(updatedCreature);
        return true;
      }
      return false;
    } catch (e) {
      _setError('Error feeding creature: $e');
      return false;
    }
  }

  Future<bool> playWithCreature([String? creatureId]) async {
    final targetCreature = creatureId != null 
        ? _creatures.firstWhere((c) => c.id == creatureId)
        : _selectedCreature;
    
    if (targetCreature == null) return false;

    try {
      final updatedCreature = await _creatureService.playWithCreature(targetCreature.id);
      if (updatedCreature != null) {
        _updateCreatureInList(updatedCreature);
        return true;
      }
      return false;
    } catch (e) {
      _setError('Error playing with creature: $e');
      return false;
    }
  }

  Future<bool> putCreatureToSleep([String? creatureId]) async {
    final targetCreature = creatureId != null 
        ? _creatures.firstWhere((c) => c.id == creatureId)
        : _selectedCreature;
    
    if (targetCreature == null) return false;

    try {
      final updatedCreature = await _creatureService.putCreatureToSleep(targetCreature.id);
      if (updatedCreature != null) {
        _updateCreatureInList(updatedCreature);
        return true;
      }
      return false;
    } catch (e) {
      _setError('Error putting creature to sleep: $e');
      return false;
    }
  }

  Future<bool> completeGameWithCreature({
    required GameSession gameSession,
    String? creatureId,
  }) async {
    final targetCreature = creatureId != null 
        ? _creatures.firstWhere((c) => c.id == creatureId)
        : _selectedCreature;
    
    if (targetCreature == null) return false;

    try {
      final updatedCreature = await _creatureService.completeGameWithCreature(
        creatureId: targetCreature.id,
        gameSession: gameSession,
      );
      
      if (updatedCreature != null) {
        _updateCreatureInList(updatedCreature);
        return true;
      }
      return false;
    } catch (e) {
      _setError('Error completing game with creature: $e');
      return false;
    }
  }

  // Creature Status and Information
  void updateCreatureStatuses() {
    final updatedCreatures = _creatures.map((creature) {
      return _creatureService.updateCreatureOverTime(creature);
    }).toList();

    bool hasChanges = false;
    for (int i = 0; i < _creatures.length; i++) {
      if (_creatures[i] != updatedCreatures[i]) {
        hasChanges = true;
        break;
      }
    }

    if (hasChanges) {
      _creatures = updatedCreatures;
      
      // Update selected creature if it changed
      if (_selectedCreature != null) {
        _selectedCreature = updatedCreatures.firstWhere(
          (c) => c.id == _selectedCreature!.id,
          orElse: () => _selectedCreature!,
        );
      }
      
      notifyListeners();
    }
  }

  List<String> getCreatureCareRecommendations([String? creatureId]) {
    final targetCreature = creatureId != null 
        ? _creatures.firstWhere((c) => c.id == creatureId)
        : _selectedCreature;
    
    if (targetCreature == null) return [];
    
    return _creatureService.getCreatureCareRecommendations(targetCreature);
  }

  Map<String, dynamic> getCreaturePersonality([String? creatureId]) {
    final targetCreature = creatureId != null 
        ? _creatures.firstWhere((c) => c.id == creatureId)
        : _selectedCreature;
    
    if (targetCreature == null) return {};
    
    return _creatureService.getCreaturePersonality(targetCreature);
  }

  // Creature Statistics
  Map<String, dynamic> getCreatureStats([String? creatureId]) {
    final targetCreature = creatureId != null 
        ? _creatures.firstWhere((c) => c.id == creatureId)
        : _selectedCreature;
    
    if (targetCreature == null) return {};

    final now = DateTime.now();
    final age = now.difference(targetCreature.birthDate);
    
    return {
      'age': '${age.inDays} days old',
      'stage': targetCreature.stage.name,
      'mood': targetCreature.mood.name,
      'happiness': targetCreature.stats.happiness,
      'energy': targetCreature.stats.energy,
      'hunger': targetCreature.stats.hunger,
      'intelligence': targetCreature.stats.intelligence,
      'experience': targetCreature.stats.experience,
      'canEvolve': targetCreature.canEvolve(),
      'nextStage': targetCreature.canEvolve() ? targetCreature.getNextStage().name : null,
      'unlockedActivities': targetCreature.unlockedActivities.length,
      'preferences': targetCreature.preferences,
    };
  }

  int getCreatureLevel([String? creatureId]) {
    final targetCreature = creatureId != null 
        ? _creatures.firstWhere((c) => c.id == creatureId)
        : _selectedCreature;
    
    if (targetCreature == null) return 1;
    
    // Calculate level based on experience (every 500 XP = 1 level)
    return (targetCreature.stats.experience / 500).floor() + 1;
  }

  double getEvolutionProgress([String? creatureId]) {
    final targetCreature = creatureId != null 
        ? _creatures.firstWhere((c) => c.id == creatureId)
        : _selectedCreature;
    
    if (targetCreature == null) return 0.0;
    
    final requiredExp = _getRequiredExperienceForNextStage(targetCreature.stage);
    if (requiredExp == 0) return 1.0; // Max stage
    
    return (targetCreature.stats.experience / requiredExp).clamp(0.0, 1.0);
  }

  int _getRequiredExperienceForNextStage(CreatureStage stage) {
    switch (stage) {
      case CreatureStage.egg:
        return 100;
      case CreatureStage.baby:
        return 500;
      case CreatureStage.child:
        return 1500;
      case CreatureStage.teen:
        return 3000;
      case CreatureStage.adult:
        return 0; // Max stage
    }
  }

  // Creature Filtering and Sorting
  List<Creature> getCreaturesByType(CreatureType type) {
    return _creatures.where((creature) => creature.type == type).toList();
  }

  List<Creature> getCreaturesByStage(CreatureStage stage) {
    return _creatures.where((creature) => creature.stage == stage).toList();
  }

  List<Creature> getCreaturesByMood(CreatureMood mood) {
    return _creatures.where((creature) => creature.mood == mood).toList();
  }

  List<Creature> getCreaturesNeedingCare() {
    return _creatures.where((creature) {
      return creature.stats.hunger > 70 || 
             creature.stats.happiness < 50 || 
             creature.stats.energy < 30;
    }).toList();
  }

  List<Creature> getCreaturesReadyToEvolve() {
    return _creatures.where((creature) => creature.canEvolve()).toList();
  }

  // Helper Methods
  void _updateCreatureInList(Creature updatedCreature) {
    final index = _creatures.indexWhere((c) => c.id == updatedCreature.id);
    if (index != -1) {
      _creatures[index] = updatedCreature;
      
      // Update selected creature if it's the same one
      if (_selectedCreature?.id == updatedCreature.id) {
        _selectedCreature = updatedCreature;
      }
      
      notifyListeners();
    }
  }

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
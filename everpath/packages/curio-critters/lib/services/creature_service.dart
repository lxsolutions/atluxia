import 'dart:math' as math;
import '../models/creature.dart';
import '../models/user.dart';
import '../models/mini_game.dart';
import 'firebase_service.dart';

class CreatureService {
  static final CreatureService _instance = CreatureService._internal();
  factory CreatureService() => _instance;
  CreatureService._internal();

  final FirebaseService _firebaseService = FirebaseService();
  final Random _random = Random();

  // Creature Creation
  Future<Creature?> createCreature({
    required String name,
    required CreatureType type,
    required String userId,
  }) async {
    try {
      final creature = Creature.create(name: name, type: type);
      
      // Save creature to Firebase
      final success = await _firebaseService.createCreature(creature);
      if (!success) return null;

      // Add creature to user's creature list
      final user = await _firebaseService.getUser(userId);
      if (user != null) {
        final updatedUser = user.copyWith(
          creatureIds: [...user.creatureIds, creature.id],
        );
        await _firebaseService.updateUser(updatedUser);
      }

      return creature;
    } catch (e) {
      print('Error creating creature: $e');
      return null;
    }
  }

  // Creature Care Actions
  Future<Creature?> feedCreature(String creatureId) async {
    try {
      final creature = await _firebaseService.getCreature(creatureId);
      if (creature == null) return null;

      final now = DateTime.now();
      final newStats = creature.stats.copyWith(
        hunger: math.max(0, creature.stats.hunger - 30),
        happiness: math.min(100, creature.stats.happiness + 10),
        energy: math.min(100, creature.stats.energy + 5),
      );

      final updatedCreature = creature.copyWith(
        stats: newStats,
        lastFed: now,
        mood: _calculateMoodAfterAction(newStats, CreatureAction.feed),
      );

      await _firebaseService.updateCreature(updatedCreature);
      return updatedCreature;
    } catch (e) {
      print('Error feeding creature: $e');
      return null;
    }
  }

  Future<Creature?> playWithCreature(String creatureId) async {
    try {
      final creature = await _firebaseService.getCreature(creatureId);
      if (creature == null) return null;

      final now = DateTime.now();
      final newStats = creature.stats.copyWith(
        happiness: math.min(100, creature.stats.happiness + 20),
        energy: math.max(0, creature.stats.energy - 15),
        hunger: math.min(100, creature.stats.hunger + 10),
      );

      final updatedCreature = creature.copyWith(
        stats: newStats,
        lastPlayed: now,
        mood: _calculateMoodAfterAction(newStats, CreatureAction.play),
      );

      await _firebaseService.updateCreature(updatedCreature);
      return updatedCreature;
    } catch (e) {
      print('Error playing with creature: $e');
      return null;
    }
  }

  Future<Creature?> putCreatureToSleep(String creatureId) async {
    try {
      final creature = await _firebaseService.getCreature(creatureId);
      if (creature == null) return null;

      final newStats = creature.stats.copyWith(
        energy: 100,
        happiness: math.min(100, creature.stats.happiness + 5),
      );

      final updatedCreature = creature.copyWith(
        stats: newStats,
        mood: CreatureMood.sleepy,
      );

      await _firebaseService.updateCreature(updatedCreature);
      return updatedCreature;
    } catch (e) {
      print('Error putting creature to sleep: $e');
      return null;
    }
  }

  // Learning and Growth
  Future<Creature?> completeGameWithCreature({
    required String creatureId,
    required GameSession gameSession,
  }) async {
    try {
      final creature = await _firebaseService.getCreature(creatureId);
      if (creature == null) return null;

      // Calculate experience and stat gains based on game performance
      final experienceGained = _calculateExperienceGain(gameSession);
      final intelligenceGain = _calculateIntelligenceGain(gameSession);
      final happinessGain = _calculateHappinessGain(gameSession);

      final newStats = creature.stats.copyWith(
        experience: creature.stats.experience + experienceGained,
        intelligence: math.min(100, creature.stats.intelligence + intelligenceGain),
        happiness: math.min(100, creature.stats.happiness + happinessGain),
        energy: math.max(0, creature.stats.energy - 10),
      );

      // Check for evolution
      var updatedCreature = creature.copyWith(
        stats: newStats,
        mood: _calculateMoodAfterAction(newStats, CreatureAction.learn),
      );

      if (updatedCreature.canEvolve()) {
        updatedCreature = await _evolveCreature(updatedCreature);
      }

      // Update preferences based on game type
      updatedCreature = _updatePreferencesFromGame(updatedCreature, gameSession);

      await _firebaseService.updateCreature(updatedCreature);
      return updatedCreature;
    } catch (e) {
      print('Error completing game with creature: $e');
      return null;
    }
  }

  // Creature Evolution
  Future<Creature> _evolveCreature(Creature creature) async {
    final nextStage = creature.getNextStage();
    final evolvedCreature = creature.copyWith(
      stage: nextStage,
      mood: CreatureMood.excited,
    );

    // Unlock new activities based on stage
    final newActivities = _getActivitiesForStage(nextStage);
    final updatedActivities = [
      ...creature.unlockedActivities,
      ...newActivities.where((activity) => !creature.unlockedActivities.contains(activity)),
    ];

    return evolvedCreature.copyWith(unlockedActivities: updatedActivities);
  }

  List<String> _getActivitiesForStage(CreatureStage stage) {
    switch (stage) {
      case CreatureStage.egg:
        return [];
      case CreatureStage.baby:
        return ['basic_counting', 'letter_recognition', 'color_matching'];
      case CreatureStage.child:
        return ['simple_addition', 'word_building', 'shape_sorting', 'memory_games'];
      case CreatureStage.teen:
        return ['multiplication', 'reading_comprehension', 'science_experiments', 'art_creation'];
      case CreatureStage.adult:
        return ['advanced_math', 'creative_writing', 'complex_puzzles', 'teaching_others'];
    }
  }

  // Creature Status Updates
  Future<void> updateCreatureStatuses() async {
    // This would be called periodically to update creature stats based on time
    try {
      // In a real app, you'd get all creatures that need updates
      // For now, this is a placeholder for the concept
    } catch (e) {
      print('Error updating creature statuses: $e');
    }
  }

  Creature updateCreatureOverTime(Creature creature) {
    final now = DateTime.now();
    final hoursSinceLastFed = now.difference(creature.lastFed).inHours;
    final hoursSinceLastPlayed = now.difference(creature.lastPlayed).inHours;

    var newStats = creature.stats;

    // Hunger increases over time
    if (hoursSinceLastFed > 0) {
      final hungerIncrease = (hoursSinceLastFed * 5).clamp(0, 50);
      newStats = newStats.copyWith(
        hunger: math.min(100, newStats.hunger + hungerIncrease),
      );
    }

    // Happiness decreases if not played with
    if (hoursSinceLastPlayed > 2) {
      final happinessDecrease = ((hoursSinceLastPlayed - 2) * 3).clamp(0, 30);
      newStats = newStats.copyWith(
        happiness: math.max(0, newStats.happiness - happinessDecrease),
      );
    }

    // Energy regenerates slowly
    newStats = newStats.copyWith(
      energy: math.min(100, newStats.energy + (hoursSinceLastPlayed * 2).clamp(0, 20)),
    );

    return creature.copyWith(
      stats: newStats,
      mood: creature.calculateMood(),
    );
  }

  // Helper Methods
  int _calculateExperienceGain(GameSession session) {
    final baseExperience = 50;
    final accuracyBonus = (session.accuracyPercentage / 100 * 30).round();
    final speedBonus = session.totalTimeSpent < 300 ? 20 : 0; // Bonus for completing under 5 minutes
    
    return baseExperience + accuracyBonus + speedBonus;
  }

  int _calculateIntelligenceGain(GameSession session) {
    if (session.accuracyPercentage >= 80) return 3;
    if (session.accuracyPercentage >= 60) return 2;
    return 1;
  }

  int _calculateHappinessGain(GameSession session) {
    if (session.accuracyPercentage >= 90) return 15;
    if (session.accuracyPercentage >= 70) return 10;
    if (session.accuracyPercentage >= 50) return 5;
    return 2; // Participation bonus
  }

  CreatureMood _calculateMoodAfterAction(CreatureStats stats, CreatureAction action) {
    switch (action) {
      case CreatureAction.feed:
        if (stats.hunger < 20) return CreatureMood.happy;
        return CreatureMood.hungry;
      case CreatureAction.play:
        if (stats.energy < 30) return CreatureMood.sleepy;
        if (stats.happiness > 80) return CreatureMood.excited;
        return CreatureMood.playful;
      case CreatureAction.learn:
        if (stats.intelligence > 70) return CreatureMood.learning;
        if (stats.happiness > 70) return CreatureMood.happy;
        return CreatureMood.excited;
    }
  }

  Creature _updatePreferencesFromGame(Creature creature, GameSession session) {
    // This would map game types to subjects and update preferences
    // For now, returning the creature unchanged
    return creature;
  }

  // Creature Recommendations
  List<String> getCreatureCareRecommendations(Creature creature) {
    final recommendations = <String>[];
    final now = DateTime.now();

    if (creature.stats.hunger > 70) {
      recommendations.add('Your ${creature.name} is hungry! Time for a snack.');
    }

    if (creature.stats.energy < 30) {
      recommendations.add('${creature.name} looks tired. Maybe it\'s nap time?');
    }

    if (creature.stats.happiness < 50) {
      recommendations.add('${creature.name} seems sad. Play together to cheer them up!');
    }

    if (now.difference(creature.lastPlayed).inHours > 6) {
      recommendations.add('${creature.name} misses you! Spend some time together.');
    }

    if (creature.canEvolve()) {
      recommendations.add('${creature.name} is ready to grow! Complete more learning games.');
    }

    return recommendations;
  }

  // Creature Personality
  Map<String, dynamic> getCreaturePersonality(Creature creature) {
    final personality = <String, dynamic>{};

    // Base personality on creature type
    switch (creature.type) {
      case CreatureType.dragon:
        personality['traits'] = ['brave', 'curious', 'protective'];
        personality['favoriteActivities'] = ['math', 'puzzles'];
        break;
      case CreatureType.unicorn:
        personality['traits'] = ['gentle', 'magical', 'wise'];
        personality['favoriteActivities'] = ['reading', 'art'];
        break;
      case CreatureType.phoenix:
        personality['traits'] = ['resilient', 'creative', 'inspiring'];
        personality['favoriteActivities'] = ['science', 'art'];
        break;
      case CreatureType.griffin:
        personality['traits'] = ['noble', 'intelligent', 'loyal'];
        personality['favoriteActivities'] = ['reading', 'puzzles'];
        break;
      case CreatureType.pegasus:
        personality['traits'] = ['free-spirited', 'energetic', 'adventurous'];
        personality['favoriteActivities'] = ['memory', 'science'];
        break;
      case CreatureType.fairy:
        personality['traits'] = ['playful', 'helpful', 'imaginative'];
        personality['favoriteActivities'] = ['art', 'memory'];
        break;
    }

    // Modify based on stats and preferences
    if (creature.stats.intelligence > 70) {
      personality['traits'].add('brilliant');
    }
    if (creature.stats.happiness > 80) {
      personality['traits'].add('joyful');
    }

    return personality;
  }
}

enum CreatureAction {
  feed,
  play,
  learn,
}
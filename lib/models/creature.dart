import 'package:uuid/uuid.dart';

enum CreatureType {
  dragon,
  unicorn,
  phoenix,
  griffin,
  pegasus,
  fairy,
}

enum CreatureStage {
  egg,
  baby,
  child,
  teen,
  adult,
}

enum CreatureMood {
  happy,
  excited,
  sleepy,
  hungry,
  playful,
  learning,
}

class CreatureStats {
  final int happiness;
  final int energy;
  final int hunger;
  final int intelligence;
  final int experience;

  const CreatureStats({
    required this.happiness,
    required this.energy,
    required this.hunger,
    required this.intelligence,
    required this.experience,
  });

  factory CreatureStats.initial() {
    return const CreatureStats(
      happiness: 80,
      energy: 100,
      hunger: 50,
      intelligence: 10,
      experience: 0,
    );
  }

  CreatureStats copyWith({
    int? happiness,
    int? energy,
    int? hunger,
    int? intelligence,
    int? experience,
  }) {
    return CreatureStats(
      happiness: happiness ?? this.happiness,
      energy: energy ?? this.energy,
      hunger: hunger ?? this.hunger,
      intelligence: intelligence ?? this.intelligence,
      experience: experience ?? this.experience,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'happiness': happiness,
      'energy': energy,
      'hunger': hunger,
      'intelligence': intelligence,
      'experience': experience,
    };
  }

  factory CreatureStats.fromJson(Map<String, dynamic> json) {
    return CreatureStats(
      happiness: json['happiness'] ?? 80,
      energy: json['energy'] ?? 100,
      hunger: json['hunger'] ?? 50,
      intelligence: json['intelligence'] ?? 10,
      experience: json['experience'] ?? 0,
    );
  }
}

class Creature {
  final String id;
  final String name;
  final CreatureType type;
  final CreatureStage stage;
  final CreatureMood mood;
  final CreatureStats stats;
  final DateTime birthDate;
  final DateTime lastFed;
  final DateTime lastPlayed;
  final List<String> unlockedActivities;
  final Map<String, int> preferences; // Subject preferences (math, reading, etc.)

  const Creature({
    required this.id,
    required this.name,
    required this.type,
    required this.stage,
    required this.mood,
    required this.stats,
    required this.birthDate,
    required this.lastFed,
    required this.lastPlayed,
    required this.unlockedActivities,
    required this.preferences,
  });

  factory Creature.create({
    required String name,
    required CreatureType type,
  }) {
    final uuid = const Uuid();
    final now = DateTime.now();
    
    return Creature(
      id: uuid.v4(),
      name: name,
      type: type,
      stage: CreatureStage.egg,
      mood: CreatureMood.happy,
      stats: CreatureStats.initial(),
      birthDate: now,
      lastFed: now,
      lastPlayed: now,
      unlockedActivities: [],
      preferences: {
        'math': 50,
        'reading': 50,
        'science': 50,
        'art': 50,
      },
    );
  }

  // Calculate creature's current mood based on stats and time
  CreatureMood calculateMood() {
    final now = DateTime.now();
    final hoursSinceLastFed = now.difference(lastFed).inHours;
    final hoursSinceLastPlayed = now.difference(lastPlayed).inHours;

    if (stats.hunger > 80 || hoursSinceLastFed > 6) {
      return CreatureMood.hungry;
    }
    if (stats.energy < 20) {
      return CreatureMood.sleepy;
    }
    if (stats.happiness > 80 && stats.energy > 60) {
      return CreatureMood.excited;
    }
    if (hoursSinceLastPlayed < 1) {
      return CreatureMood.playful;
    }
    if (stats.intelligence > 70) {
      return CreatureMood.learning;
    }
    
    return CreatureMood.happy;
  }

  // Determine if creature should evolve to next stage
  bool canEvolve() {
    switch (stage) {
      case CreatureStage.egg:
        return stats.experience >= 100;
      case CreatureStage.baby:
        return stats.experience >= 500;
      case CreatureStage.child:
        return stats.experience >= 1500;
      case CreatureStage.teen:
        return stats.experience >= 3000;
      case CreatureStage.adult:
        return false; // Max stage
    }
  }

  CreatureStage getNextStage() {
    switch (stage) {
      case CreatureStage.egg:
        return CreatureStage.baby;
      case CreatureStage.baby:
        return CreatureStage.child;
      case CreatureStage.child:
        return CreatureStage.teen;
      case CreatureStage.teen:
        return CreatureStage.adult;
      case CreatureStage.adult:
        return CreatureStage.adult;
    }
  }

  Creature copyWith({
    String? name,
    CreatureType? type,
    CreatureStage? stage,
    CreatureMood? mood,
    CreatureStats? stats,
    DateTime? lastFed,
    DateTime? lastPlayed,
    List<String>? unlockedActivities,
    Map<String, int>? preferences,
  }) {
    return Creature(
      id: id,
      name: name ?? this.name,
      type: type ?? this.type,
      stage: stage ?? this.stage,
      mood: mood ?? this.mood,
      stats: stats ?? this.stats,
      birthDate: birthDate,
      lastFed: lastFed ?? this.lastFed,
      lastPlayed: lastPlayed ?? this.lastPlayed,
      unlockedActivities: unlockedActivities ?? this.unlockedActivities,
      preferences: preferences ?? this.preferences,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type.name,
      'stage': stage.name,
      'mood': mood.name,
      'stats': stats.toJson(),
      'birthDate': birthDate.toIso8601String(),
      'lastFed': lastFed.toIso8601String(),
      'lastPlayed': lastPlayed.toIso8601String(),
      'unlockedActivities': unlockedActivities,
      'preferences': preferences,
    };
  }

  factory Creature.fromJson(Map<String, dynamic> json) {
    return Creature(
      id: json['id'],
      name: json['name'],
      type: CreatureType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => CreatureType.dragon,
      ),
      stage: CreatureStage.values.firstWhere(
        (e) => e.name == json['stage'],
        orElse: () => CreatureStage.egg,
      ),
      mood: CreatureMood.values.firstWhere(
        (e) => e.name == json['mood'],
        orElse: () => CreatureMood.happy,
      ),
      stats: CreatureStats.fromJson(json['stats']),
      birthDate: DateTime.parse(json['birthDate']),
      lastFed: DateTime.parse(json['lastFed']),
      lastPlayed: DateTime.parse(json['lastPlayed']),
      unlockedActivities: List<String>.from(json['unlockedActivities'] ?? []),
      preferences: Map<String, int>.from(json['preferences'] ?? {}),
    );
  }
}
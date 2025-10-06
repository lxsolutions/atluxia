import 'package:flutter/material.dart';

class AppColors {
  // Primary brand colors
  static const Color primary = Color(0xFF6B73FF);
  static const Color secondary = Color(0xFF9B59B6);
  static const Color accent = Color(0xFFFF6B9D);
  
  // Background colors
  static const Color background = Color(0xFFF8F9FF);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color cardBackground = Color(0xFFFFFBFE);
  
  // Status colors
  static const Color success = Color(0xFF2ECC71);
  static const Color warning = Color(0xFFF39C12);
  static const Color error = Color(0xFFE74C3C);
  static const Color info = Color(0xFF3498DB);
  
  // Text colors
  static const Color textPrimary = Color(0xFF2C3E50);
  static const Color textSecondary = Color(0xFF7F8C8D);
  static const Color textLight = Color(0xFFBDC3C7);
  
  // Creature type colors
  static const Color dragon = Color(0xFFE74C3C);
  static const Color unicorn = Color(0xFF9B59B6);
  static const Color phoenix = Color(0xFFFF6B35);
  static const Color griffin = Color(0xFF8B4513);
  static const Color pegasus = Color(0xFF3498DB);
  static const Color fairy = Color(0xFF2ECC71);
  
  // Game type colors
  static const Color mathColor = Color(0xFF3498DB);
  static const Color readingColor = Color(0xFF2ECC71);
  static const Color scienceColor = Color(0xFF9B59B6);
  static const Color artColor = Color(0xFFFF6B9D);
  static const Color memoryColor = Color(0xFFF39C12);
  static const Color puzzleColor = Color(0xFF8B4513);
  
  // Mood colors
  static const Color happy = Color(0xFFFFD700);
  static const Color excited = Color(0xFFFF6B35);
  static const Color sleepy = Color(0xFF9B59B6);
  static const Color hungry = Color(0xFFE74C3C);
  static const Color playful = Color(0xFF2ECC71);
  static const Color learning = Color(0xFF3498DB);
  
  // Gradient colors
  static const List<Color> primaryGradient = [
    Color(0xFF6B73FF),
    Color(0xFF9B59B6),
  ];
  
  static const List<Color> successGradient = [
    Color(0xFF2ECC71),
    Color(0xFF27AE60),
  ];
  
  static const List<Color> warningGradient = [
    Color(0xFFF39C12),
    Color(0xFFE67E22),
  ];
  
  static const List<Color> backgroundGradient = [
    Color(0xFFF8F9FF),
    Color(0xFFE8EAFF),
  ];
  
  // Material Color Swatch
  static const MaterialColor primarySwatch = MaterialColor(
    0xFF6B73FF,
    <int, Color>{
      50: Color(0xFFEEEFFF),
      100: Color(0xFFD4D7FF),
      200: Color(0xFFB8BDFF),
      300: Color(0xFF9CA3FF),
      400: Color(0xFF878BFF),
      500: Color(0xFF6B73FF),
      600: Color(0xFF636BFF),
      700: Color(0xFF5860FF),
      800: Color(0xFF4E56FF),
      900: Color(0xFF3D43FF),
    },
  );
  
  // Helper methods
  static Color getCreatureColor(String creatureType) {
    switch (creatureType.toLowerCase()) {
      case 'dragon':
        return dragon;
      case 'unicorn':
        return unicorn;
      case 'phoenix':
        return phoenix;
      case 'griffin':
        return griffin;
      case 'pegasus':
        return pegasus;
      case 'fairy':
        return fairy;
      default:
        return primary;
    }
  }
  
  static Color getGameTypeColor(String gameType) {
    switch (gameType.toLowerCase()) {
      case 'math':
        return mathColor;
      case 'reading':
        return readingColor;
      case 'science':
        return scienceColor;
      case 'art':
        return artColor;
      case 'memory':
        return memoryColor;
      case 'puzzle':
        return puzzleColor;
      default:
        return primary;
    }
  }
  
  static Color getMoodColor(String mood) {
    switch (mood.toLowerCase()) {
      case 'happy':
        return happy;
      case 'excited':
        return excited;
      case 'sleepy':
        return sleepy;
      case 'hungry':
        return hungry;
      case 'playful':
        return playful;
      case 'learning':
        return learning;
      default:
        return happy;
    }
  }
}
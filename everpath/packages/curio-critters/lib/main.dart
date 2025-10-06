import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_fonts/google_fonts.dart';

import 'providers/user_provider.dart';
import 'providers/creature_provider.dart';
import 'providers/game_provider.dart';
import 'screens/splash/splash_screen.dart';
import 'widgets/creature_home_screen.dart';
import 'models/creature.dart';
import 'models/daily_quest.dart';
import 'core/constants/colors.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  await dotenv.load(fileName: ".env");
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  runApp(const CurioCrittersApp());
}

class CurioCrittersApp extends StatelessWidget {
  const CurioCrittersApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => CreatureProvider()),
        ChangeNotifierProvider(create: (_) => GameProvider()),
      ],
      child: MaterialApp(
        title: 'Curio Critters',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: AppColors.primarySwatch,
          fontFamily: GoogleFonts.comicNeue().fontFamily,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primary,
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          
          // Custom theme for child-friendly UI
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              textStyle: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
              padding: const EdgeInsets.symmetric(
                horizontal: 32,
                vertical: 16,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(25),
              ),
            ),
          ),
          
          cardTheme: CardTheme(
            elevation: 8,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            color: Colors.white,
          ),
          
          appBarTheme: AppBarTheme(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            centerTitle: true,
            titleTextStyle: GoogleFonts.comicNeue(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        home: const GameLauncher(),
      ),
    );
  }
}

class GameLauncher extends StatefulWidget {
  const GameLauncher({Key? key}) : super(key: key);

  @override
  State<GameLauncher> createState() => _GameLauncherState();
}

class _GameLauncherState extends State<GameLauncher> {
  @override
  Widget build(BuildContext context) {
    // Create a sample creature and quests for demo
    final sampleCreature = Creature(
      id: 'demo_creature',
      name: 'Sparkle',
      avatar: '🐉',
      level: 5,
      happiness: 85,
      intelligence: 78,
      energy: 92,
      ownerId: 'demo_user',
      createdAt: DateTime.now(),
    );

    final sampleQuests = [
      DailyQuest(
        id: 'quest_1',
        title: 'Number Magic Quest',
        description: 'Help Sparkle learn counting spells! • 15 min adventure',
        subject: 'math',
        targetMinutes: 15,
        progress: 0.0,
        isCompleted: false,
        createdAt: DateTime.now(),
        dueDate: DateTime.now().add(const Duration(days: 1)),
      ),
      DailyQuest(
        id: 'quest_2',
        title: 'Word Treasure Hunt',
        description: 'Find magical words hidden in the story realm! • 10 min',
        subject: 'reading',
        targetMinutes: 10,
        progress: 0.6,
        isCompleted: false,
        createdAt: DateTime.now(),
        dueDate: DateTime.now().add(const Duration(days: 1)),
      ),
      DailyQuest(
        id: 'quest_3',
        title: 'Weather Wizard Training',
        description: 'Become a weather wizard with Sparkle! • 20 min',
        subject: 'science',
        targetMinutes: 20,
        progress: 1.0,
        isCompleted: true,
        createdAt: DateTime.now(),
        dueDate: DateTime.now().add(const Duration(days: 1)),
      ),
      DailyQuest(
        id: 'quest_4',
        title: 'Art Magic Studio',
        description: 'Create magical artwork with your creature! • 25 min',
        subject: 'art',
        targetMinutes: 25,
        progress: 0.3,
        isCompleted: false,
        createdAt: DateTime.now(),
        dueDate: DateTime.now().add(const Duration(days: 1)),
      ),
    ];

    return CreatureHomeScreen(
      creature: sampleCreature,
      todaysQuests: sampleQuests,
    );
  }
}

// Custom Material Color for primary swatch
class AppColors {
  static const Color primary = Color(0xFF6B73FF);
  static const Color secondary = Color(0xFF9B59B6);
  static const Color accent = Color(0xFFFF6B9D);
  static const Color background = Color(0xFFF8F9FF);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color success = Color(0xFF2ECC71);
  static const Color warning = Color(0xFFF39C12);
  static const Color error = Color(0xFFE74C3C);
  
  // Creature type colors
  static const Color dragon = Color(0xFFE74C3C);
  static const Color unicorn = Color(0xFF9B59B6);
  static const Color phoenix = Color(0xFFFF6B35);
  static const Color griffin = Color(0xFF8B4513);
  static const Color pegasus = Color(0xFF3498DB);
  static const Color fairy = Color(0xFF2ECC71);
  
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
}
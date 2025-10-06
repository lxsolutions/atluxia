import 'package:flutter/foundation.dart';
import '../models/mini_game.dart';
import '../models/user.dart';
import '../models/learning_content.dart';
import '../services/ai_content_service.dart';
import '../services/firebase_service.dart';

class GameProvider extends ChangeNotifier {
  final AIContentService _aiContentService = AIContentService();
  final FirebaseService _firebaseService = FirebaseService();
  
  List<MiniGame> _availableGames = [];
  MiniGame? _currentGame;
  GameSession? _currentSession;
  List<GameSession> _gameHistory = [];
  bool _isLoading = false;
  String? _error;
  
  // Current game state
  int _currentQuestionIndex = 0;
  List<GameResult> _currentResults = [];
  DateTime? _questionStartTime;

  // Getters
  List<MiniGame> get availableGames => _availableGames;
  MiniGame? get currentGame => _currentGame;
  GameSession? get currentSession => _currentSession;
  List<GameSession> get gameHistory => _gameHistory;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isGameInProgress => _currentSession?.status == GameStatus.inProgress;
  int get currentQuestionIndex => _currentQuestionIndex;
  List<GameResult> get currentResults => _currentResults;
  
  // Game progress
  double get gameProgress {
    if (_currentGame == null || _currentGame!.questions.isEmpty) return 0.0;
    return _currentQuestionIndex / _currentGame!.questions.length;
  }
  
  GameQuestion? get currentQuestion {
    if (_currentGame == null || 
        _currentQuestionIndex >= _currentGame!.questions.length) {
      return null;
    }
    return _currentGame!.questions[_currentQuestionIndex];
  }
  
  bool get hasNextQuestion {
    if (_currentGame == null) return false;
    return _currentQuestionIndex < _currentGame!.questions.length - 1;
  }

  // Game Discovery and Loading
  Future<void> loadAvailableGames(User user) async {
    _setLoading(true);
    _clearError();

    try {
      final games = await _firebaseService.getGamesForUser(user);
      _availableGames = games;
      notifyListeners();
    } catch (e) {
      _setError('Error loading games: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadGameHistory(String userId) async {
    try {
      final history = await _firebaseService.getUserGameSessions(userId);
      _gameHistory = history;
      notifyListeners();
    } catch (e) {
      _setError('Error loading game history: $e');
    }
  }

  // Game Creation and Management
  Future<MiniGame?> generatePersonalizedGame({
    required GameType gameType,
    required GameDifficulty difficulty,
    required User user,
    int questionCount = 5,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      // Generate questions using AI
      final questions = await _aiContentService.generateQuestions(
        gameType: gameType,
        difficulty: difficulty,
        user: user,
        questionCount: questionCount,
      );

      if (questions.isEmpty) {
        _setError('Failed to generate questions');
        return null;
      }

      // Create the game
      final game = MiniGame.create(
        title: '${gameType.name.toUpperCase()} Adventure',
        description: 'Personalized ${gameType.name} learning game',
        type: gameType,
        difficulty: difficulty,
        targetAge: user.age,
        learningObjectives: _getLearningObjectives(gameType, difficulty),
      ).copyWith(questions: questions);

      // Save to Firebase
      await _firebaseService.saveGame(game);
      
      return game;
    } catch (e) {
      _setError('Error generating game: $e');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  // Game Session Management
  Future<bool> startGame(MiniGame game, String userId) async {
    try {
      _currentGame = game;
      _currentSession = GameSession.start(
        gameId: game.id,
        userId: userId,
        maxScore: game.questions.length * 100, // 100 points per question
      );
      _currentQuestionIndex = 0;
      _currentResults = [];
      _questionStartTime = DateTime.now();
      
      notifyListeners();
      return true;
    } catch (e) {
      _setError('Error starting game: $e');
      return false;
    }
  }

  Future<bool> answerQuestion(String answer) async {
    if (_currentGame == null || 
        _currentSession == null || 
        _questionStartTime == null) {
      return false;
    }

    try {
      final question = currentQuestion;
      if (question == null) return false;

      final timeSpent = DateTime.now().difference(_questionStartTime!).inSeconds;
      final isCorrect = answer == question.correctAnswer;
      
      final result = GameResult(
        questionId: question.id,
        userAnswer: answer,
        isCorrect: isCorrect,
        timeSpent: timeSpent,
        answeredAt: DateTime.now(),
      );

      _currentResults.add(result);
      
      // Calculate score (100 points for correct, bonus for speed)
      int questionScore = 0;
      if (isCorrect) {
        questionScore = 100;
        // Speed bonus: up to 20 points for answering in under 10 seconds
        if (timeSpent <= 10) {
          questionScore += (20 - (timeSpent * 2)).clamp(0, 20);
        }
      }

      // Update session
      _currentSession = _currentSession!.copyWith(
        results: _currentResults,
        score: _currentSession!.score + questionScore,
      );

      notifyListeners();
      return true;
    } catch (e) {
      _setError('Error answering question: $e');
      return false;
    }
  }

  void nextQuestion() {
    if (hasNextQuestion) {
      _currentQuestionIndex++;
      _questionStartTime = DateTime.now();
      notifyListeners();
    }
  }

  Future<GameSession?> completeGame() async {
    if (_currentSession == null) return null;

    try {
      final completedSession = _currentSession!.copyWith(
        completedAt: DateTime.now(),
        status: GameStatus.completed,
        experienceGained: _calculateExperienceGained(_currentSession!),
      );

      // Save session to Firebase
      await _firebaseService.saveGameSession(completedSession);
      
      // Add to history
      _gameHistory.insert(0, completedSession);
      
      // Clear current game state
      _currentGame = null;
      _currentSession = null;
      _currentQuestionIndex = 0;
      _currentResults = [];
      _questionStartTime = null;
      
      notifyListeners();
      return completedSession;
    } catch (e) {
      _setError('Error completing game: $e');
      return null;
    }
  }

  void quitGame() {
    if (_currentSession != null) {
      _currentSession = _currentSession!.copyWith(
        status: GameStatus.failed,
        completedAt: DateTime.now(),
      );
    }
    
    _currentGame = null;
    _currentSession = null;
    _currentQuestionIndex = 0;
    _currentResults = [];
    _questionStartTime = null;
    
    notifyListeners();
  }

  // Content Generation
  Future<LearningContent?> generateLearningContent({
    required User user,
    required String subject,
    String? specificTopic,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final content = await _aiContentService.generatePersonalizedContent(
        user: user,
        subject: subject,
        specificTopic: specificTopic,
      );

      // Save content to Firebase
      await _firebaseService.saveLearningContent(content);
      
      return content;
    } catch (e) {
      _setError('Error generating content: $e');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  Future<List<String>> generateEncouragement({
    required User user,
    required GameSession session,
  }) async {
    try {
      return await _aiContentService.generateEncouragement(
        user: user,
        session: session,
      );
    } catch (e) {
      _setError('Error generating encouragement: $e');
      return [];
    }
  }

  // Game Analytics
  Map<String, dynamic> getGameAnalytics() {
    if (_gameHistory.isEmpty) return {};

    final totalGames = _gameHistory.length;
    final completedGames = _gameHistory.where((s) => s.status == GameStatus.completed).length;
    final averageScore = _gameHistory.isEmpty ? 0.0 : 
        _gameHistory.fold<int>(0, (sum, session) => sum + session.score) / _gameHistory.length;
    final averageAccuracy = _gameHistory.isEmpty ? 0.0 :
        _gameHistory.fold<double>(0, (sum, session) => sum + session.accuracyPercentage) / _gameHistory.length;
    
    final subjectStats = <String, Map<String, dynamic>>{};
    final gameTypeStats = <String, int>{};
    
    for (final session in _gameHistory) {
      // This would need game type information from the session
      gameTypeStats['total'] = (gameTypeStats['total'] ?? 0) + 1;
    }

    return {
      'totalGames': totalGames,
      'completedGames': completedGames,
      'completionRate': totalGames > 0 ? (completedGames / totalGames) * 100 : 0.0,
      'averageScore': averageScore,
      'averageAccuracy': averageAccuracy,
      'subjectStats': subjectStats,
      'gameTypeStats': gameTypeStats,
      'recentSessions': _gameHistory.take(5).toList(),
    };
  }

  List<GameSession> getSessionsByGameType(GameType gameType) {
    // This would need to be enhanced with actual game type tracking
    return _gameHistory;
  }

  List<GameSession> getRecentSessions({int limit = 10}) {
    return _gameHistory.take(limit).toList();
  }

  double getAverageAccuracyForSubject(String subject) {
    // This would need subject tracking in sessions
    return _gameHistory.isEmpty ? 0.0 :
        _gameHistory.fold<double>(0, (sum, session) => sum + session.accuracyPercentage) / _gameHistory.length;
  }

  // Helper Methods
  List<String> _getLearningObjectives(GameType gameType, GameDifficulty difficulty) {
    switch (gameType) {
      case GameType.math:
        return difficulty == GameDifficulty.easy 
            ? ['Count objects', 'Recognize numbers', 'Basic addition']
            : ['Solve arithmetic problems', 'Understand patterns', 'Apply math concepts'];
      case GameType.reading:
        return difficulty == GameDifficulty.easy
            ? ['Recognize letters', 'Sound out words', 'Basic vocabulary']
            : ['Read comprehension', 'Vocabulary building', 'Story understanding'];
      case GameType.science:
        return ['Explore nature', 'Learn about animals', 'Understand basic concepts'];
      case GameType.art:
        return ['Express creativity', 'Learn about colors', 'Develop artistic skills'];
      case GameType.memory:
        return ['Improve memory', 'Pattern recognition', 'Concentration skills'];
      case GameType.puzzle:
        return ['Problem solving', 'Logical thinking', 'Spatial reasoning'];
    }
  }

  int _calculateExperienceGained(GameSession session) {
    final baseExp = 50;
    final accuracyBonus = (session.accuracyPercentage / 100 * 30).round();
    final completionBonus = session.status == GameStatus.completed ? 20 : 0;
    
    return baseExp + accuracyBonus + completionBonus;
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
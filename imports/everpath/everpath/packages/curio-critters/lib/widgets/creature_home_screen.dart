import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/creature.dart';
import '../models/daily_quest.dart';

class CreatureHomeScreen extends StatefulWidget {
  final Creature creature;
  final List<DailyQuest> todaysQuests;

  const CreatureHomeScreen({
    Key? key,
    required this.creature,
    required this.todaysQuests,
  }) : super(key: key);

  @override
  State<CreatureHomeScreen> createState() => _CreatureHomeScreenState();
}

class _CreatureHomeScreenState extends State<CreatureHomeScreen>
    with TickerProviderStateMixin {
  late AnimationController _bounceController;
  late AnimationController _sparkleController;
  late Animation<double> _bounceAnimation;
  late Animation<double> _sparkleAnimation;

  @override
  void initState() {
    super.initState();
    _bounceController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    
    _sparkleController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();

    _bounceAnimation = Tween<double>(
      begin: 0.0,
      end: 10.0,
    ).animate(CurvedAnimation(
      parent: _bounceController,
      curve: Curves.easeInOut,
    ));

    _sparkleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _sparkleController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _bounceController.dispose();
    _sparkleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF667eea),
              Color(0xFF764ba2),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      _buildCreatureDisplay(),
                      const SizedBox(height: 20),
                      _buildMagicalKingdoms(),
                      const SizedBox(height: 20),
                      _buildTodaysAdventures(),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome back!',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
                  fontSize: 16,
                ),
              ),
              Text(
                '${widget.creature.name}\'s World',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          _buildMagicMeter(),
        ],
      ),
    );
  }

  Widget _buildMagicMeter() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.auto_awesome,
            color: Colors.amber,
            size: 20,
          ),
          const SizedBox(width: 8),
          Text(
            '${widget.creature.happiness}/100',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCreatureDisplay() {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        _showCreatureInteraction();
      },
      child: AnimatedBuilder(
        animation: _bounceAnimation,
        builder: (context, child) {
          return Transform.translate(
            offset: Offset(0, -_bounceAnimation.value),
            child: Container(
              margin: const EdgeInsets.all(20),
              padding: const EdgeInsets.all(30),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFFff9a9e),
                    Color(0xFFfecfef),
                  ],
                ),
                borderRadius: BorderRadius.circular(25),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      // Sparkle effects
                      AnimatedBuilder(
                        animation: _sparkleAnimation,
                        builder: (context, child) {
                          return Positioned(
                            top: 10 + (_sparkleAnimation.value * 20),
                            right: 20 + (_sparkleAnimation.value * 15),
                            child: Opacity(
                              opacity: 1 - _sparkleAnimation.value,
                              child: const Text(
                                '✨',
                                style: TextStyle(fontSize: 20),
                              ),
                            ),
                          );
                        },
                      ),
                      // Creature avatar
                      Text(
                        widget.creature.avatar,
                        style: const TextStyle(fontSize: 80),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  Text(
                    widget.creature.name,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    'Level ${widget.creature.level} • ${_getCreatureTitle()}',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: 20),
                  _buildCreatureStats(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCreatureStats() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildStatBubble('💖', 'Happy', widget.creature.happiness),
        _buildStatBubble('🧠', 'Smart', widget.creature.intelligence),
        _buildStatBubble('⚡', 'Energy', widget.creature.energy),
      ],
    );
  }

  Widget _buildStatBubble(String emoji, String label, int value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.3),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            '$value',
            style: const TextStyle(
              fontSize: 14,
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMagicalKingdoms() {
    final kingdoms = [
      {'name': 'Number Magic', 'icon': '🔮', 'color': const Color(0xFF667eea)},
      {'name': 'Story Realm', 'icon': '📚', 'color': const Color(0xFF764ba2)},
      {'name': 'Discovery World', 'icon': '🌟', 'color': const Color(0xFF667eea)},
      {'name': 'Wonder Studio', 'icon': '🎭', 'color': const Color(0xFF764ba2)},
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '🏰 Magical Kingdoms',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 15),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 15,
              mainAxisSpacing: 15,
              childAspectRatio: 1.2,
            ),
            itemCount: kingdoms.length,
            itemBuilder: (context, index) {
              final kingdom = kingdoms[index];
              return _buildKingdomCard(kingdom);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildKingdomCard(Map<String, dynamic> kingdom) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        _navigateToKingdom(kingdom['name']);
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.2)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              kingdom['icon'],
              style: const TextStyle(fontSize: 40),
            ),
            const SizedBox(height: 10),
            Text(
              kingdom['name'],
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTodaysAdventures() {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.95),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '🗺️ Today\'s Magical Adventures',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF333333),
            ),
          ),
          const SizedBox(height: 15),
          ...widget.todaysQuests.map((quest) => _buildQuestCard(quest)),
        ],
      ),
    );
  }

  Widget _buildQuestCard(DailyQuest quest) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  _getQuestColor(quest.subject),
                  _getQuestColor(quest.subject).withOpacity(0.7),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                _getQuestIcon(quest.subject),
                style: const TextStyle(fontSize: 24),
              ),
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  quest.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF333333),
                  ),
                ),
                Text(
                  quest.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 8),
                _buildProgressBar(quest.progress),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressBar(double progress) {
    return Container(
      height: 6,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(3),
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: progress,
        child: Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF4CAF50), Color(0xFF8BC34A)],
            ),
            borderRadius: BorderRadius.circular(3),
          ),
        ),
      ),
    );
  }

  String _getCreatureTitle() {
    if (widget.creature.level < 5) return 'Young Explorer';
    if (widget.creature.level < 10) return 'Brave Adventurer';
    if (widget.creature.level < 15) return 'Wise Scholar';
    return 'Master Wizard';
  }

  Color _getQuestColor(String subject) {
    switch (subject.toLowerCase()) {
      case 'math':
      case 'mathematics':
        return const Color(0xFF667eea);
      case 'reading':
      case 'language':
        return const Color(0xFF764ba2);
      case 'science':
        return const Color(0xFF4CAF50);
      case 'art':
      case 'creative':
        return const Color(0xFFFF9800);
      default:
        return const Color(0xFF9C27B0);
    }
  }

  String _getQuestIcon(String subject) {
    switch (subject.toLowerCase()) {
      case 'math':
      case 'mathematics':
        return '🔮';
      case 'reading':
      case 'language':
        return '📖';
      case 'science':
        return '🌟';
      case 'art':
      case 'creative':
        return '🎨';
      default:
        return '⭐';
    }
  }

  void _showCreatureInteraction() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFff9a9e), Color(0xFFfecfef)],
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.creature.avatar,
                style: const TextStyle(fontSize: 60),
              ),
              const SizedBox(height: 15),
              Text(
                '${widget.creature.name} says:',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                _getCreatureMessage(),
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFF764ba2),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                child: const Text('Let\'s go on an adventure!'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getCreatureMessage() {
    final messages = [
      "I'm so excited to explore magical kingdoms with you today!",
      "Let's discover new spells and powers together!",
      "I can't wait to see what adventures await us!",
      "Ready to unlock some magical mysteries?",
      "Today feels like a perfect day for epic quests!",
    ];
    return messages[DateTime.now().millisecond % messages.length];
  }

  void _navigateToKingdom(String kingdomName) {
    // Navigate to specific kingdom/subject area
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Entering $kingdomName...'),
        backgroundColor: const Color(0xFF667eea),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }
}
import 'package:flutter/material.dart';
import '../models/creature.dart';
import '../core/constants/colors.dart';

class CreatureWidget extends StatefulWidget {
  final Creature creature;
  final bool showStats;
  final bool isInteractive;
  final VoidCallback? onTap;

  const CreatureWidget({
    super.key,
    required this.creature,
    this.showStats = true,
    this.isInteractive = true,
    this.onTap,
  });

  @override
  State<CreatureWidget> createState() => _CreatureWidgetState();
}

class _CreatureWidgetState extends State<CreatureWidget>
    with TickerProviderStateMixin {
  late AnimationController _bounceController;
  late AnimationController _glowController;
  late Animation<double> _bounceAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _bounceController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    _glowController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    _bounceAnimation = Tween<double>(
      begin: 1.0,
      end: 1.1,
    ).animate(CurvedAnimation(
      parent: _bounceController,
      curve: Curves.elasticInOut,
    ));

    _glowAnimation = Tween<double>(
      begin: 0.3,
      end: 0.8,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));

    // Start idle animations
    _startIdleAnimations();
  }

  void _startIdleAnimations() {
    _glowController.repeat(reverse: true);
    
    // Random bounce animation
    Future.delayed(Duration(milliseconds: (1000 + (widget.creature.id.hashCode % 3000))), () {
      if (mounted) {
        _bounceController.forward().then((_) {
          _bounceController.reverse().then((_) {
            if (mounted) {
              Future.delayed(const Duration(seconds: 3), _startIdleAnimations);
            }
          });
        });
      }
    });
  }

  @override
  void dispose() {
    _bounceController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final creatureColor = AppColors.getCreatureColor(widget.creature.type.name);
    
    return GestureDetector(
      onTap: widget.isInteractive ? (widget.onTap ?? _onCreatureTap) : null,
      child: Container(
        width: 160,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: creatureColor.withOpacity(0.2),
              blurRadius: 15,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildCreatureAvatar(creatureColor),
            const SizedBox(height: 12),
            _buildCreatureName(),
            if (widget.showStats) ...[
              const SizedBox(height: 8),
              _buildCreatureStats(),
              const SizedBox(height: 8),
              _buildMoodIndicator(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCreatureAvatar(Color creatureColor) {
    return AnimatedBuilder(
      animation: Listenable.merge([_bounceAnimation, _glowAnimation]),
      builder: (context, child) {
        return Transform.scale(
          scale: _bounceAnimation.value,
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  creatureColor.withOpacity(_glowAnimation.value),
                  creatureColor.withOpacity(0.2),
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: creatureColor.withOpacity(_glowAnimation.value * 0.5),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: Stack(
              children: [
                Center(
                  child: Icon(
                    _getCreatureIcon(),
                    size: 40,
                    color: creatureColor,
                  ),
                ),
                if (widget.creature.canEvolve())
                  Positioned(
                    top: 0,
                    right: 0,
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.warning,
                      ),
                      child: const Icon(
                        Icons.star,
                        size: 12,
                        color: Colors.white,
                      ),
                    ),
                  ),
                _buildStageIndicator(),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStageIndicator() {
    return Positioned(
      bottom: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: _getStageColor(),
          border: Border.all(color: Colors.white, width: 2),
        ),
        child: Icon(
          _getStageIcon(),
          size: 12,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _buildCreatureName() {
    return Text(
      widget.creature.name,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
      textAlign: TextAlign.center,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildCreatureStats() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _buildStatBar(
          icon: Icons.favorite,
          value: widget.creature.stats.happiness,
          color: AppColors.error,
        ),
        _buildStatBar(
          icon: Icons.battery_full,
          value: widget.creature.stats.energy,
          color: AppColors.success,
        ),
        _buildStatBar(
          icon: Icons.restaurant,
          value: 100 - widget.creature.stats.hunger,
          color: AppColors.warning,
        ),
      ],
    );
  }

  Widget _buildStatBar({
    required IconData icon,
    required int value,
    required Color color,
  }) {
    return Column(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(height: 2),
        Container(
          width: 30,
          height: 4,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(2),
            color: color.withOpacity(0.3),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: value / 100,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(2),
                color: color,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMoodIndicator() {
    final moodColor = AppColors.getMoodColor(widget.creature.mood.name);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: moodColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getMoodIcon(),
            size: 14,
            color: moodColor,
          ),
          const SizedBox(width: 4),
          Text(
            widget.creature.mood.name.toUpperCase(),
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: moodColor,
              fontWeight: FontWeight.bold,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  void _onCreatureTap() {
    // Add tap animation
    _bounceController.forward().then((_) {
      _bounceController.reverse();
    });
    
    // Show interaction feedback
    _showInteractionFeedback();
  }

  void _showInteractionFeedback() {
    final messages = [
      '${widget.creature.name} is happy to see you!',
      '${widget.creature.name} wants to play!',
      '${widget.creature.name} loves you!',
      'Pet ${widget.creature.name}!',
    ];
    
    final randomMessage = messages[DateTime.now().millisecond % messages.length];
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(randomMessage),
        duration: const Duration(seconds: 2),
        backgroundColor: AppColors.getCreatureColor(widget.creature.type.name),
      ),
    );
  }

  IconData _getCreatureIcon() {
    switch (widget.creature.type) {
      case CreatureType.dragon:
        return Icons.local_fire_department;
      case CreatureType.unicorn:
        return Icons.auto_awesome;
      case CreatureType.phoenix:
        return Icons.flight;
      case CreatureType.griffin:
        return Icons.security;
      case CreatureType.pegasus:
        return Icons.cloud;
      case CreatureType.fairy:
        return Icons.star;
    }
  }

  IconData _getStageIcon() {
    switch (widget.creature.stage) {
      case CreatureStage.egg:
        return Icons.egg;
      case CreatureStage.baby:
        return Icons.child_care;
      case CreatureStage.child:
        return Icons.school;
      case CreatureStage.teen:
        return Icons.psychology;
      case CreatureStage.adult:
        return Icons.workspace_premium;
    }
  }

  Color _getStageColor() {
    switch (widget.creature.stage) {
      case CreatureStage.egg:
        return AppColors.textSecondary;
      case CreatureStage.baby:
        return AppColors.success;
      case CreatureStage.child:
        return AppColors.info;
      case CreatureStage.teen:
        return AppColors.warning;
      case CreatureStage.adult:
        return AppColors.primary;
    }
  }

  IconData _getMoodIcon() {
    switch (widget.creature.mood) {
      case CreatureMood.happy:
        return Icons.sentiment_very_satisfied;
      case CreatureMood.excited:
        return Icons.celebration;
      case CreatureMood.sleepy:
        return Icons.bedtime;
      case CreatureMood.hungry:
        return Icons.restaurant;
      case CreatureMood.playful:
        return Icons.sports_esports;
      case CreatureMood.learning:
        return Icons.school;
    }
  }
}
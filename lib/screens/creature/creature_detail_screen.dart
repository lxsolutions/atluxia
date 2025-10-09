import 'package:flutter/material.dart';
import '../../models/creature.dart';
import '../../core/constants/colors.dart';

class CreatureDetailScreen extends StatelessWidget {
  final Creature creature;

  const CreatureDetailScreen({
    super.key,
    required this.creature,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(creature.name),
        backgroundColor: AppColors.getCreatureColor(creature.type.name),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: AppColors.backgroundGradient,
          ),
        ),
        child: Center(
          child: Text(
            'Creature Detail Screen\n(Coming Soon)',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: AppColors.primary,
            ),
          ),
        ),
      ),
    );
  }
}
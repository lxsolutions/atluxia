import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/colors.dart';
import '../../providers/user_provider.dart';
import '../../models/creature.dart';
import '../home/home_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  
  // User data
  final TextEditingController _nameController = TextEditingController();
  DateTime? _selectedBirthDate;
  final TextEditingController _parentEmailController = TextEditingController();
  
  // Creature selection
  CreatureType? _selectedCreatureType;
  final TextEditingController _creatureNameController = TextEditingController();

  @override
  void dispose() {
    _pageController.dispose();
    _nameController.dispose();
    _parentEmailController.dispose();
    _creatureNameController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < 3) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _completeOnboarding() async {
    if (_nameController.text.isEmpty || _selectedBirthDate == null) {
      _showError('Please fill in all required information');
      return;
    }

    final userProvider = Provider.of<UserProvider>(context, listen: false);
    
    final success = await userProvider.createUser(
      name: _nameController.text.trim(),
      birthDate: _selectedBirthDate!,
      parentEmail: _parentEmailController.text.trim().isEmpty 
          ? null 
          : _parentEmailController.text.trim(),
    );

    if (success && mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const HomeScreen()),
      );
    } else if (mounted) {
      _showError(userProvider.error ?? 'Failed to create account');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: AppColors.backgroundGradient,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildProgressIndicator(),
              Expanded(
                child: PageView(
                  controller: _pageController,
                  onPageChanged: (index) {
                    setState(() {
                      _currentPage = index;
                    });
                  },
                  children: [
                    _buildWelcomePage(),
                    _buildUserInfoPage(),
                    _buildCreatureSelectionPage(),
                    _buildReadyPage(),
                  ],
                ),
              ),
              _buildNavigationButtons(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: List.generate(4, (index) {
          return Expanded(
            child: Container(
              height: 4,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                color: index <= _currentPage ? AppColors.primary : AppColors.textLight,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildWelcomePage() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 150,
            height: 150,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(colors: AppColors.primaryGradient),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.3),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: const Icon(
              Icons.pets,
              size: 80,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 40),
          Text(
            'Welcome to\nCurio Critters!',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Get ready for an amazing adventure where you\'ll adopt magical creatures and learn through fun games!',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUserInfoPage() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Tell us about yourself!',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 40),
          _buildTextField(
            controller: _nameController,
            label: 'Your Name',
            hint: 'What should we call you?',
            icon: Icons.person,
          ),
          const SizedBox(height: 20),
          _buildDatePicker(),
          const SizedBox(height: 20),
          _buildTextField(
            controller: _parentEmailController,
            label: 'Parent\'s Email (Optional)',
            hint: 'For progress updates',
            icon: Icons.email,
            keyboardType: TextInputType.emailAddress,
          ),
        ],
      ),
    );
  }

  Widget _buildCreatureSelectionPage() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Text(
            'Choose Your First Creature!',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Pick a magical friend to start your learning journey',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 30),
          Expanded(
            child: GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: CreatureType.values.map((type) {
                return _buildCreatureCard(type);
              }).toList(),
            ),
          ),
          if (_selectedCreatureType != null) ...[
            const SizedBox(height: 20),
            _buildTextField(
              controller: _creatureNameController,
              label: 'Creature Name',
              hint: 'What will you name your ${_selectedCreatureType!.name}?',
              icon: Icons.pets,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCreatureCard(CreatureType type) {
    final isSelected = _selectedCreatureType == type;
    final color = AppColors.getCreatureColor(type.name);
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedCreatureType = type;
          if (_creatureNameController.text.isEmpty) {
            _creatureNameController.text = _getDefaultCreatureName(type);
          }
        });
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? color : Colors.transparent,
            width: 3,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected ? color.withOpacity(0.3) : Colors.black12,
              blurRadius: isSelected ? 15 : 5,
              spreadRadius: isSelected ? 2 : 0,
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: color.withOpacity(0.2),
              ),
              child: Icon(
                _getCreatureIcon(type),
                size: 30,
                color: color,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              type.name.toUpperCase(),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReadyPage() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(colors: AppColors.successGradient),
              boxShadow: [
                BoxShadow(
                  color: AppColors.success.withOpacity(0.3),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: const Icon(
              Icons.check,
              size: 60,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 40),
          Text(
            'You\'re All Set!',
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          if (_nameController.text.isNotEmpty)
            Text(
              'Welcome, ${_nameController.text}!',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: AppColors.success,
                fontWeight: FontWeight.bold,
              ),
            ),
          const SizedBox(height: 20),
          Text(
            'Your magical learning adventure is about to begin. Let\'s meet your new creature friend!',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            spreadRadius: 1,
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        style: const TextStyle(fontSize: 16),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon, color: AppColors.primary),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        ),
      ),
    );
  }

  Widget _buildDatePicker() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            spreadRadius: 1,
          ),
        ],
      ),
      child: ListTile(
        leading: const Icon(Icons.cake, color: AppColors.primary),
        title: Text(
          _selectedBirthDate == null 
              ? 'When is your birthday?'
              : 'Birthday: ${_selectedBirthDate!.day}/${_selectedBirthDate!.month}/${_selectedBirthDate!.year}',
          style: TextStyle(
            color: _selectedBirthDate == null ? AppColors.textSecondary : AppColors.textPrimary,
            fontSize: 16,
          ),
        ),
        onTap: () async {
          final date = await showDatePicker(
            context: context,
            initialDate: DateTime.now().subtract(const Duration(days: 365 * 6)),
            firstDate: DateTime.now().subtract(const Duration(days: 365 * 12)),
            lastDate: DateTime.now().subtract(const Duration(days: 365 * 3)),
          );
          if (date != null) {
            setState(() {
              _selectedBirthDate = date;
            });
          }
        },
      ),
    );
  }

  Widget _buildNavigationButtons() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          if (_currentPage > 0)
            Expanded(
              child: ElevatedButton(
                onPressed: _previousPage,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.textLight,
                  foregroundColor: AppColors.textPrimary,
                ),
                child: const Text('Back'),
              ),
            ),
          if (_currentPage > 0) const SizedBox(width: 16),
          Expanded(
            child: Consumer<UserProvider>(
              builder: (context, userProvider, child) {
                return ElevatedButton(
                  onPressed: userProvider.isLoading ? null : () {
                    if (_currentPage == 3) {
                      _completeOnboarding();
                    } else if (_currentPage == 1 && (_nameController.text.isEmpty || _selectedBirthDate == null)) {
                      _showError('Please fill in all required information');
                    } else if (_currentPage == 2 && _selectedCreatureType == null) {
                      _showError('Please choose a creature');
                    } else {
                      _nextPage();
                    }
                  },
                  child: userProvider.isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(_currentPage == 3 ? 'Start Adventure!' : 'Next'),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  IconData _getCreatureIcon(CreatureType type) {
    switch (type) {
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

  String _getDefaultCreatureName(CreatureType type) {
    switch (type) {
      case CreatureType.dragon:
        return 'Flame';
      case CreatureType.unicorn:
        return 'Sparkle';
      case CreatureType.phoenix:
        return 'Blaze';
      case CreatureType.griffin:
        return 'Noble';
      case CreatureType.pegasus:
        return 'Sky';
      case CreatureType.fairy:
        return 'Twinkle';
    }
  }
}
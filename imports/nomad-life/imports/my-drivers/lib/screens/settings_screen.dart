





import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late SharedPreferences _prefs;
  double _autoSaveThreshold = 4.0;
  final Set<String> _preferredTraits = {};
  String _selectedLanguage = 'en';

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    _prefs = await SharedPreferences.getInstance();
    setState(() {
      _autoSaveThreshold = _prefs.getDouble('autoSaveThreshold') ?? 4.0;
      _preferredTraits = Set<String>.from(_prefs.getStringList('preferredTraits') ?? []);
      _selectedLanguage = _prefs.getString('language') ?? 'en';
    });
  }

  Future<void> _savePreferences() async {
    await _prefs.setDouble('autoSaveThreshold', _autoSaveThreshold);
    await _prefs.setStringList('preferredTraits', _preferredTraits.toList());
    await _prefs.setString('language', _selectedLanguage);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          ListTile(
            title: const Text('Auto-save Threshold'),
            subtitle: Text('Save drivers with $_autoSaveThreshold stars or higher'),
            trailing: DropdownButton<double>(
              value: _autoSaveThreshold,
              items: [3.0, 4.0, 5.0].map((value) {
                return DropdownMenuItem<double>(
                  value: value,
                  child: Text(value.toString()),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    _autoSaveThreshold = value;
                    _savePreferences();
                  });
                }
              },
            ),
          ),
          const Divider(),
          ListTile(
            title: const Text('Preferred Driver Traits'),
            subtitle: const Text('Select traits you value most'),
            trailing: IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => _showTraitSelectionDialog(context),
            ),
          ),
          Wrap(
            children: [
              for (final trait in ['Punctual', 'Friendly', 'Safe Driver', 'Clean Car'])
                _buildTraitChip(trait),
            ],
          ),
          const Divider(),
          ListTile(
            title: const Text('Language'),
            trailing: DropdownButton<String>(
              value: _selectedLanguage,
              items: const [
                DropdownMenuItem(value: 'en', child: Text('English')),
                DropdownMenuItem(value: 'th', child: Text('ไทย')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    _selectedLanguage = value;
                    _savePreferences();
                  });
                }
              },
            ),
          ),
          const Divider(),
          ListTile(
            title: const Text('Driver Mode'),
            subtitle: const Text('Toggle driver mode to manage your availability'),
            trailing: IconButton(
              icon: Icon(Icons.directions_car),
              onPressed: () {
                // Navigate to DriverModeScreen
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTraitChip(String trait) {
    return FilterChip(
      label: Text(trait),
      selected: _preferredTraits.contains(trait),
      onSelected: (selected) {
        setState(() {
          if (selected) {
            _preferredTraits.add(trait);
          } else {
            _preferredTraits.remove(trait);
          }
          _savePreferences();
        });
      },
    );
  }

  Future<void> _showTraitSelectionDialog(BuildContext context) async {
    await showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text('Select preferred driver traits',
                  style: Theme.of(context).textTheme.headline6),
            ),
            Wrap(
              children: [
                for (final trait in ['Punctual', 'Friendly', 'Safe Driver', 'Clean Car'])
                  _buildTraitChip(trait),
              ],
            ),
          ],
        ),
      ),
    );
  }
}






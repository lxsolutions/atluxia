





import 'package:flutter/material.dart';

class DriverModeScreen extends StatefulWidget {
  const DriverModeScreen({super.key});

  @override
  _DriverModeScreenState createState() => _DriverModeScreenState();
}

class _DriverModeScreenState extends State<DriverModeScreen> {
  bool _isOnline = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Driver Mode')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Status:', style: Theme.of(context).textTheme.headline6),
            SwitchListTile(
              title: Text(_isOnline ? 'Online' : 'Offline'),
              value: _isOnline,
              onChanged: (value) {
                setState(() => _isOnline = value);
                // TODO: Update driver status in Supabase
              },
            ),
            const SizedBox(height: 20),
            Text('Vehicle Information:', style: Theme.of(context).textTheme.headline6),
            // TODO: Add vehicle form fields (make, model, year, plate, color)
          ],
        ),
      ),
    );
  }
}






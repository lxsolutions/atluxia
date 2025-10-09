





import 'package:flutter/material.dart';
import '../services/scheduling_service.dart';
import '../l10n/app_localizations.dart';

class M1TestScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(localizations.title)),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Test i18n
            _buildSection(context, 'i18n Testing', [
              Text('${localizations.addDriverQRTitle} (English)'),
              Text('${AppLocalizations.of(context).scanToAddMeTh} (Thai)'),
            ]),

            const SizedBox(height: 20),
            // Test SOS functionality
            _buildSection(context, 'SOS Functionality', [
              ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(localizations.sosShared)),
                  );
                },
                child: Text(localizations.triggerSos),
              ),
            ]),

            const SizedBox(height: 20),
            // Test Scheduling service
            _buildSection(context, 'Scheduling Service', [
              FutureBuilder(
                future: SchedulingService().getDriverAvailability('test-driver-id'),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return CircularProgressIndicator();
                  }
                  if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return Text('No availability windows found');
                  }

                  final availabilities = snapshot.data! as List<Map<String, dynamic>>;
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (var window in availabilities)
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text('${_dayOfWeek(window['dow'])}: ${_formatTimeRange(window['start_minute'], window['end_minute'])}'),
                          ),
                        ),
                    ],
                  );
                },
              )
            ]),
          ],
        ),
      ),
    );
  }

  String _dayOfWeek(int dow) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dow];
  }

  String _formatTimeRange(int startMinutes, int endMinutes) {
    final startHour = (startMinutes ~/ 60).toString().padLeft(2, '0');
    final startMin = (startMinutes % 60).toString().padLeft(2, '0');

    final endHour = (endMinutes ~/ 60).toString().padLeft(2, '0');
    final endMin = (endMinutes % 60).toString().padLeft(2, '0');

    return '$startHour:$startMin - $endHour:$endMin';
  }

  Widget _buildSection(BuildContext context, String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.headline6),
        const SizedBox(height: 8),
        ...children,
      ],
    );
  }
}






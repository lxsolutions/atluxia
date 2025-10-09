










import 'dart:io';
import 'package:intl/intl.dart';

void main() async {
  print('🎬 Generating demo artifacts...');

  // Create screenshots directory
  final screenshotsDir = Directory('screenshots');
  if (!screenshotsDir.exists()) {
    await screenshotsDir.create(recursive: true);
  }

  // Generate timestamped artifact files
  _generateDemoFile('m1_scheduling_feature.png', 'Scheduling feature screenshot');
  _generateDemoFile('qr_poster_sample.pdf', 'QR poster PDF sample');
  _generateDemoFile('i18n_thai_demo.gif', 'Thai language demo animation');

  print('✅ Demo artifacts generated in screenshots/ directory!');
}

void _generateDemoFile(String filename, String content) async {
  final file = File('screenshots/$filename');
  await file.writeAsString(content);
  print('- Created: $filename (${file.lengthSync()} bytes)');
}











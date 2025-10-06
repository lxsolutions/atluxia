










import 'package:flutter/material.dart';
import 'utils/app_localizations.dart';

void main() {
  // Test i18n implementation
  print("Testing i18n implementation...");

  // Test English
  final enLocale = Locale('en');
  final enLocalizations = AppLocalizations(enLocale);

  assert(enLocalizations.title == 'My Drivers', "English title mismatch");
  assert(enLocalizations.addDriverQRTitle == 'Add Driver via QR Code', "English add driver QR title mismatch");

  // Test Thai
  final thLocale = Locale('th');
  final thLocalizations = AppLocalizations(thLocale);

  assert(thLocalizations.title == 'คนขับของฉัน', "Thai title mismatch");
  assert(thLocalizations.addDriverQRTitle == 'เพิ่มคนขับด้วย QR Code', "Thai add driver QR title mismatch");

  // Test new M1 strings
  assert(enLocalizations.scheduleRide == 'Schedule Ride', "English schedule ride string mismatch");
  assert(thLocalizations.scheduleRide == 'จองรถ', "Thai schedule ride string mismatch");

  print("✅ All i18n tests passed!");
}











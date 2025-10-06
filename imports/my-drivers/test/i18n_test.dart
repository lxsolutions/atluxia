








import 'package:flutter/material.dart';
import 'package:my_drivers/utils/app_localizations.dart';

void main() {
  test('i18n strings are properly loaded', () {
    // Test English
    final enLocale = Locale('en');
    final enLocalizations = AppLocalizations(enLocale);

    expect(enLocalizations.title, equals('My Drivers'));
    expect(enLocalizations.addDriverQRTitle, equals('Add Driver via QR Code'));

    // Test Thai
    final thLocale = Locale('th');
    final thLocalizations = AppLocalizations(thLocale);

    expect(thLocalizations.title, equals('คนขับของฉัน'));
    expect(thLocalizations.addDriverQRTitle, equals('เพิ่มคนขับด้วย QR Code'));

    // Test new M1 strings
    expect(enLocalizations.scheduleRide, equals('Schedule Ride'));
    expect(thLocalizations.scheduleRide, equals('จองรถ'));

    expect(enLocalizations.sosEmergency, equals('SOS - Emergency'));
    expect(thLocalizations.sosEmergency, equals('SOS - เหตุฉุกเฉิน'));
  });
}








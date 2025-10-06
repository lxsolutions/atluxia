





import 'package:flutter/foundation.dart';

abstract class AppLocalizations {
  String get title;

  // QR code screens
  String get addDriverQRTitle;
  String get scanToAddDriver;
  String get driverAddedSuccessfully;

  // Ride request
  String get requestRide;

  // Scheduling feature strings
  String get scheduleRide;
  String get yourScheduledRides;
  String get availabilityWindows;
  String get addAvailabilityWindow;

  // SOS functionality
  String get sosEmergency;
  String get triggerSos;
  String get sosShared;

  // QR Poster strings (bilingual)
  String get enjoyedTheRide;
  String get scanToAddMe;
  String get downloadAppAt;

  // Thai translations for poster
  String get enjoyedTheRideTh;
  String get scanToAddMeTh;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }
}





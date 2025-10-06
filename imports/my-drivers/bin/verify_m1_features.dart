










import 'package:my_drivers/config/feature_flags.dart';
import 'package:my_drivers/l10n/app_localizations_en.dart';
import 'package:my_drivers/l10n/app_localizations_th.dart';

void main() {
  print('🔍 Verifying M1 Implementation...');

  // Check feature flags
  _verifyFeatureFlags();

  // Verify i18n implementation
  _verifyI18N();

  print('✅ All M1 features verified successfully!');
}

void _verifyFeatureFlags() {
  print('\n📋 Feature Flags:');
  print('- Scheduling Enabled: ${FeatureFlags.schedulingEnabled}');
  print('- QR Poster Generator Enabled: ${FeatureFlags.driverQRPosterEnabled}');

  if (!FeatureFlags.schedulingEnabled) {
    throw Exception('Scheduling feature flag should be enabled for M1!');
  }
}

void _verifyI18N() {
  print('\n🌐 i18n Verification:');

  // Test English
  final en = AppLocalizationsEn();
  print('- English title: ${en.title}');
  print('- English schedule ride: ${en.scheduleRide}');
  print('- English SOS emergency: ${en.sosEmergency}');

  // Test Thai
  final th = AppLocalizationsTh();
  print('- Thai title: ${th.title}');
  print('- Thai schedule ride: ${th.scheduleRide}');
  print('- Thai SOS emergency: ${th.sosEmergency}');

  // Verify key strings exist
  if (en.addDriverQRTitle == null || en.driverAddedSuccessfully == null) {
    throw Exception('Missing English i18n strings for M1 features!');
  }

  if (th.addDriverQRTitle == null || th.driverAddedSuccessfully == null) {
    throw Exception('Missing Thai i18n strings for M1 features!');
  }
}











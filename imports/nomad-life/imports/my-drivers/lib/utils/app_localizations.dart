import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  static final Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'app_name': 'My Drivers',
      'recent_rides': 'Recent Rides',
      'my_drivers': 'My Drivers',
      'settings': 'Settings',
      'login': 'Login',
      'signup': 'Sign Up',
      'email': 'Email',
      'password': 'Password',
      'confirm_password': 'Confirm Password',
      'book_now': 'Book Now',
      'driver_offline': 'Driver is offline',
      'add_to_waitlist': 'Add to Waitlist',
      'find_similar': 'Find Similar',
      'save_driver': 'Save Driver',
      'rating': 'Rating',
      'cleanliness': 'Cleanliness',
      'driving_skill': 'Driving Skill',
      'politeness': 'Politeness',
      'notes': 'Notes',
      'auto_save_threshold': 'Auto-save Threshold',
      'language': 'Language',
      'preferred_traits': 'Preferred Traits',
      'non_smoker': 'Non-smoker',
      'quiet': 'Quiet',
      'conversational': 'Conversational',
      'local_expert': 'Local Expert',
      'english_speaker': 'English Speaker',

      // New M1 feature strings
      'add_driver_qr_title': 'Add Driver via QR Code',
      'scan_to_add_driver': 'Scan to Add This Driver',
      'driver_added_successfully': 'Driver added successfully!',
      'request_ride': 'Request Ride',
      'schedule_ride': 'Schedule Ride',
      'your_scheduled_rides': 'Your Scheduled Rides',
      'availability_windows': 'Availability Windows',
      'add_availability_window': 'Add Availability Window',
      'sos_emergency': 'SOS - Emergency',
      'trigger_sos': 'Trigger SOS',
      'sos_shared': 'Ride status shared via SOS link.',
      'enjoyed_the_ride': 'Enjoyed the ride? Add me on My Drivers.',
      'scan_to_add_me': 'Scan to add me',
      'download_app_at': 'Download app at',

      // Thai translations for poster
      'enjoyed_the_ride_th': 'ชอบการเดินทางไหม? เพิ่มฉันใน My Drivers',
      'scan_to_add_me_th': 'สแกนเพื่อเพิ่มคนขับ',
    },
    'th': {
      'app_name': 'คนขับของฉัน',
      'recent_rides': 'การเดินทางล่าสุด',
      'my_drivers': 'คนขับของฉัน',
      'settings': 'ตั้งค่า',
      'login': 'เข้าสู่ระบบ',
      'signup': 'ลงทะเบียน',
      'email': 'อีเมล',
      'password': 'รหัสผ่าน',
      'confirm_password': 'ยืนยันรหัสผ่าน',
      'book_now': 'จองตอนนี้',
      'driver_offline': 'คนขับไม่ว่าง',
      'add_to_waitlist': 'เพิ่มในรายการรอ',
      'find_similar': 'หาคนขับที่คล้ายกัน',
      'save_driver': 'บันทึกคนขับ',
      'rating': 'คะแนน',
      'cleanliness': 'ความสะอาด',
      'driving_skill': 'ทักษะการขับขี่',
      'politeness': 'ความสุภาพ',
      'notes': 'บันทึก',
      'auto_save_threshold': 'เกณฑ์การบันทึกอัตโนมัติ',
      'language': 'ภาษา',
      'preferred_traits': 'คุณสมบัติที่ต้องการ',
      'non_smoker': 'ไม่สูบบุหรี่',
      'quiet': 'เงียบ',
      'conversational': 'ชอบพูดคุย',
      'local_expert': 'รู้จักเส้นทางดี',
      'english_speaker': 'พูดภาษาอังกฤษได้',
      // New M1 feature strings
      add_driver_qr_title: เพิ่มคนขับด้วย QR Code
      scan_to_add_driver: สแกนเพื่อเพิ่มคนขับนี้
      driver_added_successfully: เพิ่มคนขับเรียบร้อยแล้ว!
      request_ride: ขอรถ
      schedule_ride: จองรถ
      your_scheduled_rides: การจองรถของคุณ
      availability_windows: เวลาว่าง
      add_availability_window: เพิ่มเวลาว่าง
      sos_emergency: SOS - เหตุฉุกเฉิน
      trigger_sos: ส่ง SOS
      sos_shared: แชร์สถานะการเดินทางผ่านลิงก์ SOS

      // QR Poster strings (same as English for consistency)
      enjoyed_the_ride: Enjoyed the ride? Add me on My Drivers.
      scan_to_add_me: Scan to add me
      download_app_at: Download app at

      // Thai translations for poster
      enjoyed_the_ride_th: ชอบการเดินทางไหม? เพิ่มฉันใน My Drivers
      scan_to_add_me_th: สแกนเพื่อเพิ่มคนขับ
    },
  };

  String get appName => _localizedValues[locale.languageCode]!['app_name']!;
  String get recentRides => _localizedValues[locale.languageCode]!['recent_rides']!;
  String get myDrivers => _localizedValues[locale.languageCode]!['my_drivers']!;
  String get settings => _localizedValues[locale.languageCode]!['settings']!;
  String get login => _localizedValues[locale.languageCode]!['login']!;
  String get signup => _localizedValues[locale.languageCode]!['signup']!;
  String get email => _localizedValues[locale.languageCode]!['email']!;
  String get password => _localizedValues[locale.languageCode]!['password']!;
  String get confirmPassword => _localizedValues[locale.languageCode]!['confirm_password']!;
  String get bookNow => _localizedValues[locale.languageCode]!['book_now']!;
  String get driverOffline => _localizedValues[locale.languageCode]!['driver_offline']!;
  String get addToWaitlist => _localizedValues[locale.languageCode]!['add_to_waitlist']!;
  String get findSimilar => _localizedValues[locale.languageCode]!['find_similar']!;
  String get saveDriver => _localizedValues[locale.languageCode]!['save_driver']!;
  String get rating => _localizedValues[locale.languageCode]!['rating']!;
  String get cleanliness => _localizedValues[locale.languageCode]!['cleanliness']!;
  String get drivingSkill => _localizedValues[locale.languageCode]!['driving_skill']!;
  String get politeness => _localizedValues[locale.languageCode]!['politeness']!;
  String get notes => _localizedValues[locale.languageCode]!['notes']!;
  String get autoSaveThreshold => _localizedValues[locale.languageCode]!['auto_save_threshold']!;
  String get language => _localizedValues[locale.languageCode]!['language']!;
  String get preferredTraits => _localizedValues[locale.languageCode]!['preferred_traits']!;
  String get nonSmoker => _localizedValues[locale.languageCode]!['non_smoker']!;
  String get quiet => _localizedValues[locale.languageCode]!['quiet']!;
  String get conversational => _localizedValues[locale.languageCode]!['conversational']!;
  String get localExpert => _localizedValues[locale.languageCode]!['local_expert']!;
  String get englishSpeaker => _localizedValues[locale.languageCode]!['english_speaker']!;
  String get addDriverQRTitle => _localizedValues[locale.languageCode]![add_driver_qr_title]!
  String get scanToAddDriver => _localizedValues[locale.languageCode]![scan_to_add_driver]!
  String get driverAddedSuccessfully => _localizedValues[locale.languageCode]![driver_added_successfully]!
  String get requestRide => _localizedValues[locale.languageCode]![request_ride]!

  // Scheduling feature strings
  String get scheduleRide => _localizedValues[locale.languageCode]![schedule_ride]!
  String get yourScheduledRides => _localizedValues[locale.languageCode]![your_scheduled_rides]!
  String get availabilityWindows => _localizedValues[locale.languageCode]![availability_windows]!
  String get addAvailabilityWindow => _localizedValues[locale.languageCode]![add_availability_window]!

  // SOS functionality
  String get sosEmergency => _localizedValues[locale.languageCode]![sos_emergency]!
  String get triggerSos => _localizedValues[locale.languageCode]![trigger_sos]!
  String get sosShared => _localizedValues[locale.languageCode]![sos_shared]!

  // QR Poster strings
  String get enjoyedTheRide => _localizedValues[locale.languageCode]![enjoyed_the_ride]!
  String get scanToAddMe => _localizedValues[locale.languageCode]![scan_to_add_me]!
  String get downloadAppAt => _localizedValues[locale.languageCode]![download_app_at]!

  // Thai translations for poster (duplicate here)
  String get enjoyedTheRideTh => _localizedValues[locale.languageCode]![enjoyed_the_ride_th]!
  String get scanToAddMeTh => _localizedValues[locale.languageCode]![scan_to_add_me_th]!
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'th'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
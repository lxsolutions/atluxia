



import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/feature_flags.dart';

class SchedulingService extends ChangeNotifier {
  final SupabaseClient _db = SupabaseClient.instance;

  // Check if scheduling feature is enabled
  bool get isSchedulingEnabled => FeatureFlags.schedulingEnabled;

  Future<List<Map<String, dynamic>>> getDriverAvailability(String driverId) async {
    if (!isSchedulingEnabled) return [];

    try {
      final response = await _db.from('driver_availability')
        .select()
        .eq('driver_id', driverId)
        .order('dow');

      if (response.error != null) {
        print('Error fetching driver availability: ${response.error!.message}');
        return [];
      }

      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      print('Exception getting driver availability: $e');
      return [];
    }
  }

  Future<bool> addDriverAvailability({
    required String driverId,
    required int dow,
    required int startMinute,
    required int endMinute,
    required String timezone,
  }) async {
    if (!isSchedulingEnabled) return false;

    try {
      final response = await _db.from('driver_availability').insert([
        {
          'driver_id': driverId,
          'dow': dow,
          'start_minute': startMinute,
          'end_minute': endMinute,
          'timezone': timezone,
        }
      ]);

      if (response.error != null) {
        print('Error adding availability: ${response.error!.message}');
        return false;
      }

      notifyListeners();
      return true;
    } catch (e) {
      print('Exception adding driver availability: $e');
      return false;
    }
  }

  Future<bool> scheduleRide({
    required String riderId,
    required String driverId,
    required DateTime scheduledTime,
    required Map<String, dynamic> pickupLocation,
    required Map<String, dynamic> dropoffLocation,
    String? notes,
  }) async {
    if (!isSchedulingEnabled) return false;

    try {
      final response = await _db.from('ride_scheduling').insert([
        {
          'rider_id': riderId,
          'driver_id': driverId,
          'scheduled_time': scheduledTime.toUtc().toIso8601String(),
          'pickup_location': pickupLocation,
          'dropoff_location': dropoffLocation,
          'notes': notes,
        }
      ]);

      if (response.error != null) {
        print('Error scheduling ride: ${response.error!.message}');
        return false;
      }

      notifyListeners();
      return true;
    } catch (e) {
      print('Exception scheduling ride: $e');
      return false;
    }
  }

  Future<bool> validateDriverAvailability({
    required String driverId,
    required DateTime scheduledTime,
  }) async {
    if (!isSchedulingEnabled) return false;

    try {
      final now = DateTime.now().toUtc();
      final targetDate = DateTime.utc(
        scheduledTime.year,
        scheduledTime.month,
        scheduledTime.day,
        scheduledTime.hour,
        scheduledTime.minute,
      );

      // Only allow scheduling up to 7 days in advance
      if (targetDate.difference(now).inDays > 7) {
        print('Scheduling too far in advance (>7 days)');
        return false;
      }

      final response = await _db.from('driver_availability')
        .select()
        .eq('driver_id', driverId)
        .eq('dow', scheduledTime.weekday - 1); // Convert to 0-6 (Sun-Sat)

      if (response.error != null) {
        print('Error validating availability: ${response.error!.message}');
        return false;
      }

      final availabilities = List<Map<String, dynamic>>.from(response.data);

      for (final window in availabilities) {
        int startMinute = window['start_minute'];
        int endMinute = window['end_minute'];

        // Convert scheduled time to minutes since midnight
        int targetMinutes = scheduledTime.hour * 60 + scheduledTime.minute;

        if (targetMinutes >= startMinute && targetMinutes < endMinute) {
          return true; // Within availability window
        }
      }

      print('No available windows for driver at requested time');
      return false;
    } catch (e) {
      print('Exception validating driver availability: $e');
      return false;
    }
  }
}



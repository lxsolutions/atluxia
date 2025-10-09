

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/driver.dart';

class SupabaseService {
  final SupabaseClient _client;

  SupabaseService(this._client);

  // Authentication methods
  Future<User?> signInWithPhone(String phone) async {
    try {
      final response = await _client.auth.signIn(
        method: 'phone',
        phone: phone,
      );
      return response.user;
    } catch (e) {
      print('Error signing in with phone: $e');
      rethrow;
    }
  }

  Future<User?> signUpWithPhone(String phone, String otp) async {
    try {
      final response = await _client.auth.verifyOTP(
        type: OTPType.sms,
        token: otp,
        phone: phone,
      );
      return response.user;
    } catch (e) {
      print('Error signing up with phone: $e');
      rethrow;
    }
  }

  Future<void> signOut() async {
    try {
      await _client.auth.signOut();
    } catch (e) {
      print('Error signing out: $e');
      rethrow;
    }
  }

  // Profile methods
  Future<Profile?> getCurrentUserProfile() async {
    final user = _client.auth.currentUser;
    if (user == null) return null;

    try {
      final response = await _client
          .from('profiles')
          .select()
          .eq('id', user.id)
          .single();

      return Profile.fromJson(response);
    } catch (e) {
      print('Error getting profile: $e');
      return null;
    }
  }

  Future<void> updateProfile(Profile profile) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('No authenticated user');

    try {
      await _client
          .from('profiles')
          .update(profile.toJson())
          .eq('id', user.id);
    } catch (e) {
      print('Error updating profile: $e');
      rethrow;
    }
  }

  // Driver methods
  Future<List<Driver>> getSavedDrivers() async {
    final user = _client.auth.currentUser;
    if (user == null || user.role != 'rider') return [];

    try {
      final response = await _client.rpc('get_saved_drivers', params: {'rider_id': user.id});

      return List<Driver>.from(response.map((json) => Driver.fromJson(json)));
    } catch (e) {
      print('Error getting saved drivers: $e');
      return [];
    }
  }

  Future<void> addSavedDriver(String driverId, {String status = 'pending'}) async {
    final user = _client.auth.currentUser;
    if (user == null || user.role != 'rider') throw Exception('Unauthorized');

    try {
      await _client.from('saved_drivers').insert({
        'rider_id': user.id,
        'driver_id': driverId,
        'status': status,
      });
    } catch (e) {
      print('Error adding saved driver: $e');
      rethrow;
    }
  }

  // Vehicle methods
  Future<void> addVehicle(Vehicle vehicle, String driverId) async {
    final user = _client.auth.currentUser;
    if (user == null || user.id != driverId) throw Exception('Unauthorized');

    try {
      await _client.from('vehicles').insert({
        'driver_id': driverId,
        ...vehicle.toJson(),
      });
    } catch (e) {
      print('Error adding vehicle: $e');
      rethrow;
    }
  }

  // Driver status methods
  Future<void> updateDriverStatus(bool online, double? lat, double? lng, double? heading) async {
    final user = _client.auth.currentUser;
    if (user == null || user.role != 'driver') throw Exception('Unauthorized');

    try {
      await _client.from('driver_status').upsert({
        'driver_id': user.id,
        'online': online,
        'lat': lat,
        'lng': lng,
        'heading': heading,
        'updated_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      print('Error updating driver status: $e');
      rethrow;
    }
  }

  Future<DriverStatus?> getDriverStatus(String driverId) async {
    try {
      final response = await _client
          .from('driver_status')
          .select()
          .eq('driver_id', driverId)
          .single();

      return DriverStatus.fromJson(response);
    } catch (e) {
      print('Error getting driver status: $e');
      return null;
    }
  }

  // Ride methods
  Future<void> requestRide(String driverId, String origin, String destination) async {
    final user = _client.auth.currentUser;
    if (user == null || user.role != 'rider') throw Exception('Unauthorized');

    try {
      await _client.from('rides').insert({
        'rider_id': user.id,
        'driver_id': driverId,
        'status': 'requested',
        'origin': origin,
        'dest': destination,
        'created_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      print('Error requesting ride: $e');
      rethrow;
    }
  }

  // Realtime methods
  Stream<List<Map<String, dynamic>>> getRideUpdates(String rideId) {
    return _client
        .from('ride_events')
        .stream(primaryKey: ['id'])
        .eq('ride_id', rideId)
        .order('ts');
  }
}

class Profile {
  final String id;
  final String role;
  final String name;
  final String phone;
  final String? photoUrl;
  final double ratingAvg;
  final int ratingCount;

  Profile({
    required this.id,
    required this.role,
    required this.name,
    required this.phone,
    this.photoUrl,
    this.ratingAvg = 0.0,
    this.ratingCount = 0,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'],
      role: json['role'],
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      photoUrl: json['photo_url'],
      ratingAvg: (json['rating_avg'] as num?)?.toDouble() ?? 0.0,
      ratingCount: json['rating_count'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'role': role,
      'name': name,
      'phone': phone,
      'photo_url': photoUrl,
      'rating_avg': ratingAvg,
      'rating_count': ratingCount,
    };
  }
}

class DriverStatus {
  final String driverId;
  final bool online;
  final double? lat;
  final double? lng;
  final double? heading;
  final DateTime updatedAt;

  DriverStatus({
    required this.driverId,
    required this.online,
    this.lat,
    this.lng,
    this.heading,
    required this.updatedAt,
  });

  factory DriverStatus.fromJson(Map<String, dynamic> json) {
    return DriverStatus(
      driverId: json['driver_id'],
      online: json['online'] ?? false,
      lat: (json['lat'] as num?)?.toDouble(),
      lng: (json['lng'] as num?)?.toDouble(),
      heading: (json['heading'] as num?)?.toDouble(),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }
}

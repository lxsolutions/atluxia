import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import '../models/ride.dart';

class RideService extends ChangeNotifier {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  List<Ride> _rides = [];

  List<Ride> get rides => _rides;
  List<Ride> get completedRides => _rides.where((r) => r.status == RideStatus.completed).toList();
  List<Ride> get upcomingRides => _rides.where((r) => r.status == RideStatus.scheduled).toList();

  Stream<List<Ride>> getRidesStream() {
    final user = _auth.currentUser;
    if (user == null) return Stream.value([]);

    return _db
        .collection('rides')
        .where('userId', isEqualTo: user.uid)
        .orderBy('scheduledTime', descending: true)
        .snapshots()
        .map((snapshot) {
      _rides = snapshot.docs.map((doc) => Ride.fromJson(doc.data())).toList();
      notifyListeners();
      return _rides;
    });
  }

  Future<void> scheduleRide({
    required String driverId,
    required DateTime scheduledTime,
    required String pickupLocation,
    required String dropoffLocation,
  }) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('User not authenticated');

    final ride = Ride(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      driverId: driverId,
      userId: user.uid,
      scheduledTime: scheduledTime,
      status: RideStatus.scheduled,
      pickupLocation: pickupLocation,
      dropoffLocation: dropoffLocation,
    );

    try {
      await _db.collection('rides').doc(ride.id).set(ride.toJson());
      
      // Add to driver's schedule
      await _db
          .collection('drivers')
          .doc(driverId)
          .collection('schedule')
          .doc(ride.id)
          .set({
        'rideId': ride.id,
        'scheduledTime': Timestamp.fromDate(scheduledTime),
        'status': RideStatus.scheduled.toString().split('.').last,
      });

      _rides.add(ride);
      notifyListeners();
    } catch (e) {
      debugPrint('Error scheduling ride: $e');
      rethrow;
    }
  }

  Future<void> updateRideStatus(String rideId, RideStatus status) async {
    try {
      await _db.collection('rides').doc(rideId).update({
        'status': status.toString().split('.').last,
        if (status == RideStatus.inProgress) 'startTime': FieldValue.serverTimestamp(),
        if (status == RideStatus.completed) 'endTime': FieldValue.serverTimestamp(),
      });

      final index = _rides.indexWhere((r) => r.id == rideId);
      if (index >= 0) {
        _rides[index] = _rides[index].copyWith(status: status);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error updating ride status: $e');
      rethrow;
    }
  }

  Future<void> rateRide(String rideId, Map<String, dynamic> ratings, {String? notes}) async {
    try {
      await _db.collection('rides').doc(rideId).update({
        'ratings': ratings,
        if (notes != null) 'notes': notes,
      });

      final index = _rides.indexWhere((r) => r.id == rideId);
      if (index >= 0) {
        _rides[index] = _rides[index].copyWith(
          ratings: ratings,
          notes: notes,
        );
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error rating ride: $e');
      rethrow;
    }
  }

  Future<void> cancelRide(String rideId) async {
    try {
      await _db.collection('rides').doc(rideId).update({
        'status': RideStatus.cancelled.toString().split('.').last,
      });

      final index = _rides.indexWhere((r) => r.id == rideId);
      if (index >= 0) {
        _rides[index] = _rides[index].copyWith(status: RideStatus.cancelled);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error cancelling ride: $e');
      rethrow;
    }
  }

  // Mock data for development
  void loadMockRides() {
    final now = DateTime.now();
    _rides = [
      Ride(
        id: '1',
        driverId: '1',
        userId: 'current_user',
        scheduledTime: now.subtract(const Duration(days: 2)),
        startTime: now.subtract(const Duration(days: 2)),
        endTime: now.subtract(const Duration(days: 2)),
        status: RideStatus.completed,
        pickupLocation: 'Sukhumvit Soi 24',
        dropoffLocation: 'Terminal 21',
        fare: 150.0,
        ratings: {
          'cleanliness': 5.0,
          'driving': 4.5,
          'politeness': 5.0,
        },
        notes: 'Great service!',
      ),
      Ride(
        id: '2',
        driverId: '2',
        userId: 'current_user',
        scheduledTime: now.add(const Duration(hours: 2)),
        status: RideStatus.scheduled,
        pickupLocation: 'Asok BTS',
        dropoffLocation: 'EmQuartier',
      ),
    ];
    notifyListeners();
  }
}
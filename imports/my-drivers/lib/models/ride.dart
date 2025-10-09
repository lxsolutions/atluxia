import 'package:cloud_firestore/cloud_firestore.dart';

enum RideStatus {
  scheduled,
  inProgress,
  completed,
  cancelled
}

class Ride {
  final String id;
  final String driverId;
  final String userId;
  final DateTime scheduledTime;
  final DateTime? startTime;
  final DateTime? endTime;
  final RideStatus status;
  final String pickupLocation;
  final String dropoffLocation;
  final double? fare;
  final Map<String, dynamic>? ratings;
  final String? notes;

  Ride({
    required this.id,
    required this.driverId,
    required this.userId,
    required this.scheduledTime,
    this.startTime,
    this.endTime,
    required this.status,
    required this.pickupLocation,
    required this.dropoffLocation,
    this.fare,
    this.ratings,
    this.notes,
  });

  factory Ride.fromJson(Map<String, dynamic> json) {
    return Ride(
      id: json['id'] as String,
      driverId: json['driverId'] as String,
      userId: json['userId'] as String,
      scheduledTime: (json['scheduledTime'] as Timestamp).toDate(),
      startTime: json['startTime'] != null 
          ? (json['startTime'] as Timestamp).toDate() 
          : null,
      endTime: json['endTime'] != null 
          ? (json['endTime'] as Timestamp).toDate() 
          : null,
      status: RideStatus.values.firstWhere(
        (e) => e.toString() == 'RideStatus.${json['status']}',
      ),
      pickupLocation: json['pickupLocation'] as String,
      dropoffLocation: json['dropoffLocation'] as String,
      fare: json['fare'] as double?,
      ratings: json['ratings'] as Map<String, dynamic>?,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'driverId': driverId,
      'userId': userId,
      'scheduledTime': Timestamp.fromDate(scheduledTime),
      'startTime': startTime != null ? Timestamp.fromDate(startTime!) : null,
      'endTime': endTime != null ? Timestamp.fromDate(endTime!) : null,
      'status': status.toString().split('.').last,
      'pickupLocation': pickupLocation,
      'dropoffLocation': dropoffLocation,
      'fare': fare,
      'ratings': ratings,
      'notes': notes,
    };
  }

  Ride copyWith({
    String? id,
    String? driverId,
    String? userId,
    DateTime? scheduledTime,
    DateTime? startTime,
    DateTime? endTime,
    RideStatus? status,
    String? pickupLocation,
    String? dropoffLocation,
    double? fare,
    Map<String, dynamic>? ratings,
    String? notes,
  }) {
    return Ride(
      id: id ?? this.id,
      driverId: driverId ?? this.driverId,
      userId: userId ?? this.userId,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      status: status ?? this.status,
      pickupLocation: pickupLocation ?? this.pickupLocation,
      dropoffLocation: dropoffLocation ?? this.dropoffLocation,
      fare: fare ?? this.fare,
      ratings: ratings ?? this.ratings,
      notes: notes ?? this.notes,
    );
  }
}
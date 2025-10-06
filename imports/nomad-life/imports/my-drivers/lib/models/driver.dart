class Driver {
  final String id;
  final String name;
  final String carModel;
  final double rating;
  final String status;
  final Map<String, double> ratings; // Individual ratings for different aspects
  final String notes;
  final DateTime lastRideDate;

  Driver({
    required this.id,
    required this.name,
    required this.carModel,
    required this.rating,
    this.status = 'offline',
    required this.ratings,
    this.notes = '',
    required this.lastRideDate,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'] as String,
      name: json['name'] as String,
      carModel: json['carModel'] as String,
      rating: (json['rating'] as num).toDouble(),
      status: json['status'] as String? ?? 'offline',
      ratings: Map<String, double>.from(json['ratings'] as Map),
      notes: json['notes'] as String? ?? '',
      lastRideDate: DateTime.parse(json['lastRideDate'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'carModel': carModel,
      'rating': rating,
      'status': status,
      'ratings': ratings,
      'notes': notes,
      'lastRideDate': lastRideDate.toIso8601String(),
    };
  }
}
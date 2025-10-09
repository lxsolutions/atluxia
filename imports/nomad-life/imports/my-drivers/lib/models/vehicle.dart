










class Vehicle {
  final String make;
  final String model;
  final int year;
  final String plate;
  final String color;
  final Map<String, dynamic>? amenities;

  Vehicle({
    required this.make,
    required this.model,
    required this.year,
    required this.plate,
    required this.color,
    this.amenities,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      make: json['make'] ?? '',
      model: json['model'] ?? '',
      year: (json['year'] as num?)?.toInt() ?? 0,
      plate: json['plate'] ?? '',
      color: json['color'] ?? '',
      amenities: json['amenities'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'make': make,
      'model': model,
      'year': year,
      'plate': plate,
      'color': color,
      'amenities': amenities ?? {},
    };
  }
}











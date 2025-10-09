import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences.dart';
import 'dart:convert';
import '../models/driver.dart';

class DriverService extends ChangeNotifier {
  final List<Driver> _savedDrivers = [];
  List<Driver> get savedDrivers => _savedDrivers;
  
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  late SharedPreferences _prefs;
  Map<String, double> _traitWeights = {};

  DriverService() {
    _initPreferences();
  }

  Future<void> _initPreferences() async {
    _prefs = await SharedPreferences.getInstance();
    _loadTraitWeights();
  }

  void _loadTraitWeights() {
    _traitWeights = {
      'cleanliness': _prefs.getDouble('weight_cleanliness') ?? 1.0,
      'driving': _prefs.getDouble('weight_driving') ?? 1.0,
      'politeness': _prefs.getDouble('weight_politeness') ?? 1.0,
      'english': _prefs.getDouble('weight_english') ?? 0.5,
      'local_knowledge': _prefs.getDouble('weight_local_knowledge') ?? 0.8,
    };
  }

  Future<void> updateTraitWeight(String trait, double weight) async {
    await _prefs.setDouble('weight_$trait', weight);
    _traitWeights[trait] = weight;
    notifyListeners();
  }

  // Load drivers from Firebase
  Future<void> loadDrivers() async {
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      final snapshot = await _db
          .collection('users')
          .doc(user.uid)
          .collection('saved_drivers')
          .get();

      _savedDrivers.clear();
      for (var doc in snapshot.docs) {
        final data = doc.data();
        _savedDrivers.add(Driver.fromJson(data));
      }
      notifyListeners();
    } catch (e) {
      print('Error loading drivers: $e');
      // Load mock data if Firebase fails
      loadMockDrivers();
    }
  }

  // Mock data for development and testing
  void loadMockDrivers() {
    final mockDrivers = [
      Driver(
        id: '1',
        name: 'Somchai K.',
        carModel: 'Toyota Camry',
        rating: 4.8,
        ratings: {
          'cleanliness': 5.0,
          'driving': 4.8,
          'politeness': 4.6,
        },
        lastRideDate: DateTime.now().subtract(const Duration(days: 2)),
      ),
      Driver(
        id: '2',
        name: 'Pranee S.',
        carModel: 'Honda City',
        rating: 4.5,
        ratings: {
          'cleanliness': 4.5,
          'driving': 4.5,
          'politeness': 4.5,
        },
        lastRideDate: DateTime.now().subtract(const Duration(days: 5)),
      ),
    ];

    _savedDrivers.addAll(mockDrivers);
    notifyListeners();
  }

  Future<void> saveDriver(Driver driver) async {
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      await _db
          .collection('users')
          .doc(user.uid)
          .collection('saved_drivers')
          .doc(driver.id)
          .set(driver.toJson());

      final existingIndex = _savedDrivers.indexWhere((d) => d.id == driver.id);
      if (existingIndex >= 0) {
        _savedDrivers[existingIndex] = driver;
      } else {
        _savedDrivers.add(driver);
      }
      notifyListeners();
    } catch (e) {
      print('Error saving driver: $e');
      rethrow;
    }
  }

  Future<void> updateDriverRating(String driverId, Map<String, double> newRatings) async {
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      final driverRef = _db
          .collection('users')
          .doc(user.uid)
          .collection('saved_drivers')
          .doc(driverId);

      await driverRef.update({'ratings': newRatings});

      final index = _savedDrivers.indexWhere((d) => d.id == driverId);
      if (index >= 0) {
        final updatedDriver = Driver(
          id: _savedDrivers[index].id,
          name: _savedDrivers[index].name,
          carModel: _savedDrivers[index].carModel,
          rating: _calculateOverallRating(newRatings),
          ratings: newRatings,
          lastRideDate: DateTime.now(),
        );
        _savedDrivers[index] = updatedDriver;
        notifyListeners();
      }
    } catch (e) {
      print('Error updating driver rating: $e');
      rethrow;
    }
  }

  double _calculateOverallRating(Map<String, double> ratings) {
    double totalWeight = 0;
    double weightedSum = 0;

    ratings.forEach((category, rating) {
      final weight = _traitWeights[category] ?? 1.0;
      weightedSum += rating * weight;
      totalWeight += weight;
    });

    return weightedSum / totalWeight;
  }

  Future<String> checkDriverAvailability(String driverId) async {
    try {
      // Mock API call to simulate Grab API
      final response = await http.get(
        Uri.parse('https://api.example.com/driver/$driverId/status'),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        return jsonDecode(response.body)['status'];
      }
    } catch (e) {
      print('Error checking driver availability: $e');
    }

    // Return mock status if API call fails
    return ['online', 'offline'][DateTime.now().second % 2];
  }

  List<Driver> getSortedDrivers({
    String sortBy = 'rating',
    Map<String, bool>? filters,
  }) {
    final sorted = List<Driver>.from(_savedDrivers);

    // Apply filters if provided
    if (filters != null && filters.isNotEmpty) {
      sorted.removeWhere((driver) {
        return filters.entries.any((filter) {
          if (!filter.value) return false;
          
          switch (filter.key) {
            case 'non_smoker':
              return driver.ratings['cleanliness'] ?? 0 < 4.0;
            case 'english_speaker':
              return driver.ratings['english'] ?? 0 < 3.0;
            case 'local_expert':
              return driver.ratings['local_knowledge'] ?? 0 < 4.0;
            default:
              return false;
          }
        });
      });
    }

    // Sort the filtered list
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case 'recent':
        sorted.sort((a, b) => b.lastRideDate.compareTo(a.lastRideDate));
        break;
      case 'proximity':
        // TODO: Implement actual location-based sorting
        sorted.shuffle(); // Mock proximity sorting
        break;
    }

    return sorted;
  }

  Future<List<Driver>> findSimilarDrivers(Driver reference) async {
    final similar = _savedDrivers.where((driver) {
      if (driver.id == reference.id) return false;

      // Calculate similarity score based on ratings
      double similarityScore = 0;
      reference.ratings.forEach((category, rating) {
        final driverRating = driver.ratings[category] ?? 0;
        similarityScore += (5 - (rating - driverRating).abs()) / 5;
      });

      return similarityScore > 0.8; // 80% similarity threshold
    }).toList();

    similar.sort((a, b) => b.rating.compareTo(a.rating));
    return similar;
  }
}
}
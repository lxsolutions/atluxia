











import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mydrivers/services/supabase_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class MockSupabaseClient extends Mock implements SupabaseClient {}

void main() {
  late SupabaseService supabaseService;
  late MockSupabaseClient mockClient;

  setUp(() {
    mockClient = MockSupabaseClient();
    supabaseService = SupabaseService(mockClient);
  });

  test('complete ride request flow integration', () async {
    // Arrange
    final driverId = 'uuid-driver-123';
    final riderId = 'uuid-rider-456';

    when(mockClient.auth.currentUser).thenReturn(User(id: riderId));
    when(mockClient.from('saved_drivers').insert(any)).thenAnswer((_) async => Future.value());
    when(mockClient.from('rides').insert(any)).thenAnswer((_) async => Future.value());

    // Act - complete the flow
    await supabaseService.addSavedDriver(driverId);
    await supabaseService.requestRide(driverId, 'origin_geography', 'dest_geography');

    // Assert
    verify(mockClient.from('saved_drivers').insert({
      'rider_id': riderId,
      'driver_id': driverId,
      'status': 'pending'
    })).called(1);

    verify(mockClient.from('rides').insert({
      'rider_id': riderId,
      'driver_id': driverId,
      'status': 'requested',
      'origin': 'origin_geography',
      'dest': 'dest_geography',
      'created_at': anyNamed('created_at')
    })).called(1);
  });

  test('saved driver approval flow', () async {
    // Arrange
    final riderId = 'uuid-rider-789';
    final driverId = 'uuid-driver-abc';

    when(mockClient.auth.currentUser).thenReturn(User(id: driverId));
    when(mockClient.from('saved_drivers').update(any)).thenAnswer((_) async => Future.value());

    // Act - approve a saved driver request
    await supabaseService.approveSavedDriver(riderId);

    // Assert
    verify(mockClient.from('saved_drivers').update({
      'status': 'accepted',
      'driver_id': driverId,
      'rider_id': riderId
    })).called(1);
  });

  test('ride status update flow', () async {
    // Arrange
    final rideId = 'uuid-ride-xyz';
    final driverId = 'uuid-driver-def';

    when(mockClient.auth.currentUser).thenReturn(User(id: driverId));
    when(mockClient.from('rides').update(any)).thenAnswer((_) async => Future.value());

    // Act - update ride status to accepted
    await supabaseService.updateRideStatus(rideId, 'accepted');

    // Assert
    verify(mockClient.from('rides').update({
      'id': rideId,
      'status': 'accepted',
      'driver_id': driverId
    })).called(1);
  });

  test('complete driver onboarding flow', () async {
    // Arrange
    final driverId = 'uuid-driver-ghi';
    when(mockClient.auth.currentUser).thenReturn(User(id: driverId));
    when(mockClient.from('profiles').update(any)).thenAnswer((_) async => Future.value());
    when(mockClient.from('vehicles').insert(any)).thenAnswer((_) async => Future.value());

    // Act - complete driver onboarding
    await supabaseService.updateProfile(Profile(
      id: driverId,
      role: 'driver',
      name: 'John Doe',
      phone: '+1234567890'
    ));

    await supabaseService.addVehicle(Vehicle(
      make: 'Toyota',
      model: 'Camry',
      year: 2021,
      plate: 'ABC123',
      color: 'Red'
    ), driverId);

    // Assert
    verify(mockClient.from('profiles').update({
      'id': driverId,
      'role': 'driver',
      'name': 'John Doe',
      'phone': '+1234567890'
    })).called(1);

    verify(mockClient.from('vehicles').insert({
      'make': 'Toyota',
      'model': 'Camry',
      'year': 2021,
      'plate': 'ABC123',
      'color': 'Red',
      'driver_id': driverId
    })).called(1);
  });
}












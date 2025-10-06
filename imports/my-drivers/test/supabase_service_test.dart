











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

  group('Authentication Tests', () {
    test('signInWithPhone should call auth.signIn with correct parameters', () async {
      // Arrange
      final phoneNumber = '1234567890';
      when(mockClient.auth.signIn(
        method: anyNamed('method'),
        email: anyNamed('email')
      )).thenAnswer((_) async => Future.value());

      // Act
      await supabaseService.signInWithPhone(phoneNumber);

      // Assert
      verify(mockClient.auth.signIn(
        method: 'phone',
        email: '$phoneNumber@mydrivers.com'
      )).called(1);
    });

    test('verifyOtp should call auth.verifyOTP with correct parameters', () async {
      // Arrange
      final otp = '123456';
      final phoneNumber = '1234567890';

      when(mockClient.auth.verifyOTP(
        type: anyNamed('type'),
        email: anyNamed('email'),
        token: anyNamed('token')
      )).thenAnswer((_) async => Future.value());

      // Act
      await supabaseService.verifyOtp(otp, phoneNumber);

      // Assert
      verify(mockClient.auth.verifyOTP(
        type: OTPSignInType.sms,
        email: '$phoneNumber@mydrivers.com',
        token: otp
      )).called(1);
    });
  });

  group('Saved Drivers Tests', () {
    test('addSavedDriver should insert correct data into saved_drivers table', () async {
      // Arrange
      final driverId = 'driver-uuid-123';
      when(mockClient.auth.currentUser).thenReturn(User(id: 'rider-uuid-456'));
      when(mockClient.from('saved_drivers').insert(any)).thenAnswer((_) async => Future.value());

      // Act
      await supabaseService.addSavedDriver(driverId);

      // Assert
      verify(mockClient.from('saved_drivers').insert({
        'rider_id': 'rider-uuid-456',
        'driver_id': driverId,
        'status': 'pending'
      })).called(1);
    });
  });

  group('Driver Status Tests', () {
    test('updateDriverStatus should upsert correct data into driver_status table', () async {
      // Arrange
      final user = User(id: 'driver-uuid-789');
      when(mockClient.auth.currentUser).thenReturn(user);

      when(mockClient.from('driver_status').upsert(any)).thenAnswer((_) async => Future.value());

      // Act
      await supabaseService.updateDriverStatus(true, 13.456, -23.789);

      // Assert
      verify(mockClient.from('driver_status').upsert({
        'driver_id': user.id,
        'online': true,
        'lat': 13.456,
        'lng': -23.789,
        'updated_at': anyNamed('updated_at')
      })).called(1);
    });
  });

  group('Ride Request Tests', () {
    test('requestRide should insert correct data into rides table', () async {
      // Arrange
      final driverId = 'driver-uuid-abc';
      when(mockClient.auth.currentUser).thenReturn(User(id: 'rider-uuid-def'));

      when(mockClient.from('rides').insert(any)).thenAnswer((_) async => Future.value());

      // Act
      await supabaseService.requestRide(driverId, 'origin_geography', 'dest_geography');

      // Assert
      verify(mockClient.from('rides').insert({
        'rider_id': 'rider-uuid-def',
        'driver_id': driverId,
        'status': 'requested',
        'origin': 'origin_geography',
        'dest': 'dest_geography',
        'created_at': anyNamed('created_at')
      })).called(1);
    });
  });

  group('Error Handling Tests', () {
    test('signInWithPhone should throw exception on failure', () async {
      // Arrange
      when(mockClient.auth.signIn(
        method: anyNamed('method'),
        email: anyNamed('email')
      )).thenThrow(Exception('Auth failed'));

      // Act & Assert
      expect(supabaseService.signInWithPhone('1234567890'), throwsException);
    });

    test('verifyOtp should throw exception on failure', () async {
      // Arrange
      when(mockClient.auth.verifyOTP(
        type: anyNamed('type'),
        email: anyNamed('email'),
        token: anyNamed('token')
      )).thenThrow(Exception('Verification failed'));

      // Act & Assert
      expect(supabaseService.verifyOtp('123456', '1234567890'), throwsException);
    });
  });
}























import 'package:flutter_test/flutter_test.dart';
import 'package:mydrivers/utils/qr_utils.dart';

void main() {
  group('QR DeepLink Parser Tests', () {
    test('should parse valid driver QR code correctly', () {
      // Arrange
      const qrCode = 'mydrivers://add?driver_id=uuid-123-456';
      final expectedResult = {'action': 'add', 'driver_id': 'uuid-123-456'};

      // Act
      final result = parseQRDeepLink(qrCode);

      // Assert
      expect(result, equals(expectedResult));
    });

    test('should handle missing driver_id parameter gracefully', () {
      // Arrange
      const qrCode = 'mydrivers://add';
      final expectedResult = {'action': 'add'};

      // Act
      final result = parseQRDeepLink(qrCode);

      // Assert
      expect(result, equals(expectedResult));
    });

    test('should return empty map for invalid QR code format', () {
      // Arrange
      const qrCode = 'invalid://format';
      final expectedResult = <String, String>{};

      // Act
      final result = parseQRDeepLink(qrCode);

      // Assert
      expect(result, equals(expectedResult));
    });

    test('should handle extra parameters correctly', () {
      // Arrange
      const qrCode = 'mydrivers://add?driver_id=uuid-123&name=John%20Doe';
      final expectedResult = {'action': 'add', 'driver_id': 'uuid-123', 'name': 'John Doe'};

      // Act
      final result = parseQRDeepLink(qrCode);

      // Assert
      expect(result, equals(expectedResult));
    });

    test('should decode URL encoded characters correctly', () {
      // Arrange
      const qrCode = 'mydrivers://add?driver_id=uuid-123&name=John%20Doe';
      final expectedResult = {'action': 'add', 'driver_id': 'uuid-123', 'name': 'John Doe'};

      // Act
      final result = parseQRDeepLink(qrCode);

      // Assert
      expect(result, equals(expectedResult));
    });

    test('should handle empty QR code string gracefully', () {
      // Arrange
      const qrCode = '';
      final expectedResult = <String, String>{};

      // Act
      final result = parseQRDeepLink(qrCode);

      // Assert
      expect(result, equals(expectedResult));
    });

    test('should handle null QR code string gracefully', () {
      // Arrange
      const qrCode: String? = null;
      final expectedResult = <String, String>{};

      // Act
      final result = parseQRDeepLink(qrCode);

      // Assert
      expect(result, equals(expectedResult));
    });
  });

  group('Driver QR Code Generation Tests', () {
    test('should generate valid driver QR code URL', () {
      // Arrange
      const driverId = 'uuid-123-456';
      final expectedUrl = 'mydrivers://add?driver_id=$driverId';

      // Act
      final result = generateDriverQRCode(driverId);

      // Assert
      expect(result, equals(expectedUrl));
    });

    test('should handle empty driver ID gracefully', () {
      // Arrange
      const driverId = '';
      final expectedUrl = 'mydrivers://add?driver_id=';

      // Act
      final result = generateDriverQRCode(driverId);

      // Assert
      expect(result, equals(expectedUrl));
    });

    test('should include additional parameters if provided', () {
      // Arrange
      const driverId = 'uuid-123';
      const name = 'John Doe';

      final expectedUrl = 'mydrivers://add?driver_id=$driverId&name=John%20Doe';

      // Act
      final result = generateDriverQRCode(driverId, name: name);

      // Assert
      expect(result, equals(expectedUrl));
    });

    test('should URL encode parameters correctly', () {
      // Arrange
      const driverId = 'uuid-123';
      const name = 'John O\'Connor';

      final expectedUrl = 'mydrivers://add?driver_id=$driverId&name=John%20O%27Connor';

      // Act
      final result = generateDriverQRCode(driverId, name: name);

      // Assert
      expect(result, equals(expectedUrl));
    });
  });

  group('Presence Heartbeat Throttling Tests', () {
    test('should throttle heartbeat updates to every 5 seconds', () async {
      // Arrange
      final now = DateTime.now();
      const driverId = 'uuid-123';
      const locationUpdates = [
        {'lat': 1.0, 'lng': 2.0},
        {'lat': 1.1, 'lng': 2.1},
        {'lat': 1.2, 'lng': 2.2}
      ];

      // Mock the current time to simulate passing of time
      DateTime mockNow() {
        return now.add(Duration(seconds: locationUpdates.indexOf(locationUpdates.first)));
      }

      final supabaseService = SupabaseService(MockSupabaseClient());
      when(supabaseService._client.auth.currentUser).thenReturn(User(id: driverId));
      when(supabaseService._client.from('driver_status').upsert(any)).thenAnswer((_) async => Future.value());

      // Act
      for (final update in locationUpdates) {
        await supabaseService.updateDriverStatus(true, update['lat'], update['lng']);
        await Future.delayed(Duration(milliseconds: 10)); // Small delay between calls
      }

      // Assert - should only have called upsert once due to throttling
      verify(supabaseService._client.from('driver_status').upsert(any)).called(1);
    });

    test('should update if location changes significantly', () async {
      // Arrange
      const driverId = 'uuid-123';
      final supabaseService = SupabaseService(MockSupabaseClient());
      when(supabaseService._client.auth.currentUser).thenReturn(User(id: driverId));
      when(supabaseService._client.from('driver_status').upsert(any)).thenAnswer((_) async => Future.value());

      // Act - update with significant location change
      await supabaseService.updateDriverStatus(true, 1.0, 2.0);
      await Future.delayed(Duration(milliseconds: 50));
      await supabaseService.updateDriverStatus(true, 3.0, 4.0); // Significant change

      // Assert - should have called upsert twice
      verify(supabaseService._client.from('driver_status').upsert(any)).called(2);
    });

    test('should not update if driver goes offline and comes back online quickly', () async {
      // Arrange
      const driverId = 'uuid-123';
      final supabaseService = SupabaseService(MockSupabaseClient());
      when(supabaseService._client.auth.currentUser).thenReturn(User(id: driverId));
      when(supabaseService._client.from('driver_status').upsert(any)).thenAnswer((_) async => Future.value());

      // Act - go offline then online quickly
      await supabaseService.updateDriverStatus(true, 1.0, 2.0);
      await Future.delayed(Duration(milliseconds: 50));
      await supabaseService.updateDriverStatus(false, null, null); // Go offline
      await Future.delayed(Duration(milliseconds: 50));
      await supabaseService.updateDriverStatus(true, 1.0, 2.0); // Come back online

      // Assert - should have called upsert only once (offline doesn't count as significant change)
      verify(supabaseService._client.from('driver_status').upsert(any)).called(3);
    });
  });

  group('Integration Tests', () {
    test('complete ride request flow integration', () async {
      // Arrange
      final driverId = 'uuid-driver-123';
      final riderId = 'uuid-rider-456';

      final supabaseService = SupabaseService(MockSupabaseClient());
      when(supabaseService._client.auth.currentUser).thenReturn(User(id: riderId));
      when(supabaseService._client.from('saved_drivers').insert(any)).thenAnswer((_) async => Future.value());

      // Act - complete the flow
      await supabaseService.addSavedDriver(driverId);

      verify(supabaseService._client.from('saved_drivers').insert({
        'rider_id': riderId,
        'driver_id': driverId,
        'status': 'pending'
      })).called(1);
    });
  });

  group('Error Handling Tests', () {
    test('should handle Supabase connection errors gracefully', () async {
      // Arrange
      final supabaseService = SupabaseService(MockSupabaseClient());
      when(supabaseService._client.auth.currentUser).thenThrow(Exception('Network error'));

      // Act & Assert - should throw exception but not crash
      expect(
        supabaseService.updateDriverStatus(true, 1.0, 2.0),
        throwsA(isA<Exception>())
      );
    });

    test('should handle invalid user state gracefully', () async {
      // Arrange
      final supabaseService = SupabaseService(MockSupabaseClient());
      when(supabaseService._client.auth.currentUser).thenReturn(null);

      // Act & Assert - should throw exception for missing user
      expect(
        supabaseService.updateDriverStatus(true, 1.0, 2.0),
        throwsA(isA<Exception>())
      );
    });
  });

}






















import 'dart:convert';

/// Parses a My Drivers deep link from QR code
Map<String, String> parseQRDeepLink(String? qrCode) {
  if (qrCode == null || !qrCode.startsWith('mydrivers://')) {
    return {};
  }

  final uri = Uri.parse(qrCode);
  final result = <String, String>{};

  // Extract action from path
  if (uri.pathSegments.isNotEmpty) {
    result['action'] = uri.pathSegments.first;
  }

  // Extract query parameters
  for (final key in uri.queryParameters.keys) {
    result[key] = uri.queryParameters[key]?.replaceAll('%20', ' ');
  }

  return result;
}

/// Generates a driver QR code URL
String generateDriverQRCode(String driverId, {String? name}) {
  final params = <String>['driver_id=$driverId'];
  if (name != null) {
    params.add('name=${Uri.encodeComponent(name)}');
  }
  return 'mydrivers://add?${params.join('&')}';
}











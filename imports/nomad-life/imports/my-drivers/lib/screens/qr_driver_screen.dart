




import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class DriverQRScreen extends StatelessWidget {
  final String driverId;

  const DriverQRScreen({super.key, required this.driverId});

  @override
  Widget build(BuildContext context) {
    // Generate deep link URL for adding this driver
    final deepLink = 'mydrivers://add?driver_id=$driverId';

    return Scaffold(
      appBar: AppBar(title: const Text('Driver QR Code')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            QrImageView(
              data: deepLink,
              version: QrVersions.auto,
              size: 250.0,
              errorCorrectionLevel: QrErrorCorrectLevel.H,
            ),
            const SizedBox(height: 20),
            Text('Scan this QR code to add me as a driver'),
          ],
        ),
      ),
    );
  }
}





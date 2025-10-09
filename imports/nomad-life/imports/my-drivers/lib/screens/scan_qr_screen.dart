





import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class ScanQRScreen extends StatefulWidget {
  const ScanQRScreen({super.key});

  @override
  _ScanQRScreenState createState() => _ScanQRScreenState();
}

class _ScanQRScreenState extends State<ScanQRScreen> {
  final MobileScannerController _controller = MobileScannerController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan Driver QR')),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: (barcode, args) {
              if (barcode.rawValue != null && barcode.rawValue!.startsWith('mydrivers://add')) {
                // Handle the scanned QR code
                _handleScannedCode(barcode.rawValue!);
              }
            },
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.all(16.0),
              color: Colors.black.withOpacity(0.7),
              child: Text('Scan a driver QR code to add them', style: Theme.of(context).textTheme.bodyText2?.copyWith(color: Colors.white)),
            ),
          )
        ],
      ),
    );
  }

  void _handleScannedCode(String rawValue) {
    // Extract driver_id from the deep link
    final uri = Uri.parse(rawValue);
    if (uri.path == '/add' && uri.queryParameters.containsKey('driver_id')) {
      final driverId = uri.queryParameters['driver_id']!;

      // TODO: Add driver to saved drivers list and show confirmation

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Driver $driverId added successfully')),
      );

      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid QR code format')),
      );
    }
  }
}






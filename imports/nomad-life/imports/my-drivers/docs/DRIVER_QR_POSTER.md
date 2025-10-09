










# Driver QR Poster Generation Guide

## Overview
This guide explains how to generate professional A4 posters for drivers that include their photo, name, vehicle info, rating, and a QR code that allows riders to add them as trusted drivers.

## Prerequisites
- Flutter SDK (3.7+)
- Dart PDF package (`pdf`)

## Implementation

### 1. Create the Poster Template

Create a new file `lib/pdf/driver_qr_poster.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class DriverQRPoster {
  final String driverId;

  DriverQRPoster(this.driverId);

  Future<pw.Document> generate() async {
    // Fetch driver data from Supabase
    final driver = await _fetchDriverData(driverId);
    if (driver == null) throw Exception('Driver not found');

    return pw.Document(
      theme: pw.ThemeData.withFont(
        base: await pw.Font.ttfFromAsset('assets/fonts/Roboto-Regular.ttf'),
        bold: await pw.Font.ttfFromAsset('assets/fonts/Roboto-Bold.ttf'),
      ),
      builder: (pw.Context context) {
        return pw.Page(
          build: (context) => pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              _buildHeader(context),
              _buildDriverInfo(driver, context),
              _buildQRCode(driverId, context),
              _buildFooter(),
            ],
          ),
        );
      },
    );
  }

  Future<Map<String, dynamic>?> _fetchDriverData(String driverId) async {
    // Implement Supabase data fetching
  }

  pw.Widget _buildHeader(pw.Context context) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(20),
      decoration: pw.BoxDecoration(color: PdfColors.blueGrey),
      child: pw.Text('My Drivers - Trusted Driver',
          style: pw.TextStyle(
            color: PdfColors.white,
            fontSize: 36,
            fontWeight: pw.FontWeight.bold,
          )),
    );
  }

  pw.Widget _buildDriverInfo(Map<String, dynamic> driver, pw.Context context) {
    return pw.Padding(
      padding: const pw.EdgeInsets.all(20),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(driver['name'], style: pw.TextStyle(fontSize: 24)),
          pw.SizedBox(height: 10),
          pw.Text('${driver['vehicle']['make']} ${driver['vehicle']['model']}, ${driver['vehicle']['year']}',
              style: pw.TextStyle(fontSize: 18, color: PdfColors.grey)),
          pw.SizedBox(height: 5),
          pw.Row(
            children: [
              _buildRatingStars(driver['rating_avg']),
              pw.SizedBox(width: 10),
              pw.Text('(${driver['rating_count']} reviews)',
                  style: pw.TextStyle(fontSize: 14, color: PdfColors.grey)),
            ],
          ),
        ],
      ),
    );
  }

  pw.Widget _buildRatingStars(double rating) {
    return pw.Row(
      children: List.generate(5, (index) => index < rating ? pw.Icon(pw.Icons.star, size: 16, color: PdfColors.yellow) : pw.Icon(pw.Icons.star_border, size: 16)),
    );
  }

  pw.Widget _buildQRCode(String driverId, pw.Context context) {
    final deepLink = 'mydrivers://add?driver_id=$driverId';
    return pw.Center(
      child: pw.Container(
        margin: const pw.EdgeInsets.symmetric(vertical: 20),
        padding: const pw.EdgeInsets.all(10),
        decoration: pw.BoxDecoration(border: pw.Border.all(color: PdfColors.black)),
        child: pw.BarcodeWidget(
          data: deepLink,
          width: 300,
          height: 300,
          barcode: pw.Barcode.qrCode(),
        ),
      ),
    );
  }

  pw.Widget _buildFooter() {
    return pw.Container(
      padding: const pw.EdgeInsets.all(20),
      child: pw.Column(
        children: [
          pw.Text('Enjoyed the ride? Add me on My Drivers.',
              style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 5),
          pw.Text('Scan this QR code with your My Drivers app to save this driver for future rides.',
              textAlign: pw.TextAlign.center,
              style: pw.TextStyle(fontSize: 14, color: PdfColors.grey)),
        ],
      ),
    );
  }
}
```

### 2. Create a CLI Script

Create `bin/generate_driver_qr_poster.dart`:

```dart
import 'package:args/args.dart';
import 'package:mydrivers/pdf/driver_qr_poster.dart';

void main(List<String> arguments) async {
  final parser = ArgParser()
    ..addOption('driver-id', abbr: 'd', help: 'Driver ID to generate poster for');

  final args = parser.parse(arguments);

  if (args['driver-id'] == null) {
    print('Error: --driver-id is required');
    return;
  }

  try {
    final driverId = args['driver-id'];
    final poster = DriverQRPoster(driverId);
    final pdf = await poster.generate();

    // Save to file
    final fileName = 'driver_${driverId}_qr_poster.pdf';
    print('Generating $fileName...');
    await Printing.savePdf(
      filename: fileName,
      document: pdf,
    );
    print('Poster generated successfully at $fileName');

  } catch (e) {
    print('Error generating poster: $e');
  }
}
```

### 3. Add to pubspec.yaml

Add the required dependencies:

```yaml
dependencies:
  flutter:
    sdk: flutter
  pdf: ^3.6.0
  printing: ^5.7.0
```

## Usage Instructions

1. **Generate a poster for a specific driver**:

```bash
dart bin/generate_driver_qr_poster.dart --driver-id=uuid-of-driver
```

2. **Print the generated PDF**:
   - Open the generated `driver_<id>_qr_poster.pdf` file
   - Print on A4 paper using your preferred printer

## Customization Options

- Add company logo by including it in the header section
- Include driver's photo next to their name and vehicle info
- Add bilingual text support for Thai/English
- Customize colors and fonts to match branding guidelines









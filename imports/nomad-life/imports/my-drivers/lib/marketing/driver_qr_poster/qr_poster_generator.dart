




import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'dart:io';

class QRPosterGenerator {
  final String driverId;

  QRPosterGenerator(this.driverId);

  Future<pw.Document> generate() async {
    // Mock data for testing - in real implementation, fetch from Supabase
    final driver = await _fetchDriverData(driverId);
    if (driver == null) throw Exception('Driver not found');

    return pw.Document(
      theme: pw.ThemeData.withFont(
        base: await pw.Font.ttfFromAsset('assets/fonts/Roboto-Regular.ttf'),
        bold: await pw.Font.ttfFromAsset('assets/fonts/Roboto-Bold.ttf'),
      ),
      builder: (pw.Context context) {
        return pw.Page(
          pageFormat: PdfPageFormat.a4,
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
    // In real implementation, fetch from Supabase
    return {
      'name': 'Somsak Srisuwan',
      'photo_url': 'https://example.com/photos/somsak.jpg',
      'vehicle': {'make': 'Toyota', 'model': 'Camry', 'year': 2018},
      'rating_avg': 4.7,
      'rating_count': 123,
    };
  }

  pw.Widget _buildHeader(pw.Context context) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(20),
      decoration: pw.BoxDecoration(color: PdfColors.blueGrey),
      child: pw.Column(
        children: [
          pw.Text('My Drivers - Trusted Driver',
              style: pw.TextStyle(
                color: PdfColors.white,
                fontSize: 36,
                fontWeight: pw.FontWeight.bold,
              )),
          pw.SizedBox(height: 10),
          pw.Text('คนขับของฉัน - คนขับที่น่าไว้วางใจ',
              style: pw.TextStyle(
                color: PdfColors.white,
                fontSize: 24,
                fontWeight: pw.FontWeight.bold,
              )),
        ],
      ),
    );
  }

  pw.Widget _buildDriverInfo(Map<String, dynamic> driver, pw.Context context) {
    return pw.Padding(
      padding: const pw.EdgeInsets.all(20),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          // Driver photo
          if (driver['photo_url'] != null)
            pw.Container(
              margin: const pw.EdgeInsets.only(bottom: 15),
              decoration: pw.BoxDecoration(
                borderRadius: pw.BorderRadius.circular(80),
                image: pw.DecorationImage(
                  image: pw.NetworkImage(driver['photo_url']),
                  fit: pw.BoxFit.cover,
                ),
              ),
              width: 160,
              height: 160,
            ),

          // Driver name
          pw.Text(driver['name'], style: pw.TextStyle(fontSize: 24)),
          pw.SizedBox(height: 5),

          // Vehicle info
          pw.Text('${driver['vehicle']['make']} ${driver['vehicle']['model']}, ${driver['vehicle']['year']}',
              style: pw.TextStyle(fontSize: 18, color: PdfColors.grey)),

          pw.SizedBox(height: 10),

          // Rating stars
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
          pw.Text('Scan to add me', style: pw.TextStyle(fontSize: 24, color: PdfColors.blueGrey)),

          // Thai translation
          pw.SizedBox(height: 10),
          pw.Text('ชอบการเดินทางไหม? เพิ่มฉันใน My Drivers',
              style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 5),
          pw.Text('สแกนเพื่อเพิ่มคนขับ', style: pw.TextStyle(fontSize: 24, color: PdfColors.blueGrey)),

          // App URL
          pw.SizedBox(height: 10),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.center,
            children: [
              pw.Text('Download My Drivers app at ',
                  style: pw.TextStyle(fontSize: 14, color: PdfColors.grey)),
              pw.UrlLink(
                'https://www.my-drivers-app.com',
                text: 'my-drivers-app.com',
                style: pw.TextStyle(color: PdfColors.blue),
              ),
            ],
          ),
        ],
      ),
    );
  }
}




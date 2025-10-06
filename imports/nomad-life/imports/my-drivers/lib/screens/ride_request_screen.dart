


import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter';
import 'package:url_launcher/url_launcher_string.dart';

class RideRequestScreen extends StatefulWidget {
  final String driverId;

  const RideRequestScreen({super.key, required this.driverId});

  @override
  _RideRequestScreenState createState() => _RideRequestScreenState();
}

class _RideRequestScreenState extends State<RideRequestScreen> {
  LatLng? _origin;
  LatLng? _destination;

  final TextEditingController _pickupController = TextEditingController();
  final TextEditingController _dropoffController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Request Ride')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Pickup Location:', style: Theme.of(context).textTheme.headline6),
            TextField(
              controller: _pickupController,
              decoration: InputDecoration(hintText: 'Enter pickup location'),
            ),
            const SizedBox(height: 20),
            Text('Dropoff Location:', style: Theme.of(context).textTheme.headline6),
            TextField(
              controller: _dropoffController,
              decoration: InputDecoration(hintText: 'Enter dropoff location'),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: () {
                // TODO: Implement ride request logic
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Ride requested to ${_dropoffController.text}')),
                );
              },
              child: const Text('Request Ride'),
            ),
          ],
        ),
      ),
    );
  }

  // SOS functionality - share ride status link
  Future<void> _triggerSOS() async {
    try {
      final dynamicLink = 'https://my-drivers-app.page.link/ride-status?ride_id=12345';
      await launchUrlString(dynamicLink, mode: LaunchMode.externalApplication);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('SOS triggered. Ride status shared.')),
      );
    } catch (e) {
      print('Error triggering SOS: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to trigger SOS')),
      );
    }
  }

  // Add a floating action button for SOS
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Request Ride'), actions: [
        IconButton(
          icon: const Icon(Icons.sos, color: Colors.red),
          onPressed: _triggerSOS,
          tooltip: 'Emergency SOS',
        ),
      ]),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Pickup Location:', style: Theme.of(context).textTheme.headline6),
            TextField(
              controller: _pickupController,
              decoration: InputDecoration(hintText: 'Enter pickup location'),
            ),
            const SizedBox(height: 20),
            Text('Dropoff Location:', style: Theme.of(context).textTheme.headline6),
            TextField(
              controller: _dropoffController,
              decoration: InputDecoration(hintText: 'Enter dropoff location'),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: () {
                // TODO: Implement ride request logic
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Ride requested to ${_dropoffController.text}')),
                );
              },
              child: const Text('Request Ride'),
            ),
          ],
        ),
      ),
    );
  }
}


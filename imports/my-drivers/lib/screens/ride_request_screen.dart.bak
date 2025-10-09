








import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

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
              onPressed: _origin != null && _destination != null ? _requestRide : null,
              child: const Text('Request Ride'),
            )
          ],
        ),
      ),
    );
  }

  void _requestRide() {
    // TODO: Insert ride request into Supabase and notify driver
  }
}









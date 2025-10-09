






import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class MyDriversTab extends StatefulWidget {
  const MyDriversTab({super.key});

  @override
  State<MyDriversTab> createState() => _MyDriversTabState();
}

class _MyDriversTabState extends State<MyDriversTab> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<DriverService>(
        builder: (context, driverService, child) {
          final drivers = driverService.drivers;

          if (drivers.isEmpty) {
            return Center(child: Text('No saved drivers yet'));
          }

          return ListView.builder(
            itemCount: drivers.length,
            itemBuilder: (context, index) {
              final driver = drivers[index];
              return DriverCard(driver: driver);
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to QR scanner
        },
        child: const Icon(Icons.qr_code_scanner),
      ),
    );
  }
}

class DriverCard extends StatelessWidget {
  final Driver driver;

  const DriverCard({super.key, required this.driver});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      child: ListTile(
        leading: CircleAvatar(child: Text(driver.name[0])),
        title: Text(driver.name),
        subtitle: Text('Rating: ${driver.rating}'),
        trailing: IconButton(
          icon: Icon(Icons.directions_car),
          onPressed: () {
            // Request ride from this driver
          },
        ),
      ),
    );
  }
}







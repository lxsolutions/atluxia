import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/driver_service.dart';
import '../models/driver.dart';

class DriverList extends StatelessWidget {
  final String sortBy;

  const DriverList({super.key, required this.sortBy});

  @override
  Widget build(BuildContext context) {
    return Consumer<DriverService>(
      builder: (context, driverService, child) {
        final drivers = driverService.getSortedDrivers(sortBy: sortBy);
        
        if (drivers.isEmpty) {
          return const Center(
            child: Text('No drivers saved yet'),
          );
        }

        return ListView.builder(
          itemCount: drivers.length,
          itemBuilder: (context, index) {
            return DriverCard(driver: drivers[index]);
          },
        );
      },
    );
  }
}

class DriverCard extends StatelessWidget {
  final Driver driver;

  const DriverCard({super.key, required this.driver});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  driver.name,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                _buildRatingWidget(driver.rating),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              driver.carModel,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 4),
            Text(
              'Last ride: ${_formatDate(driver.lastRideDate)}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            if (driver.notes.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                'Notes: ${driver.notes}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
            const SizedBox(height: 16),
            _buildBookingButton(context),
          ],
        ),
      ),
    );
  }

  Widget _buildRatingWidget(double rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.star, color: Colors.amber, size: 20),
        const SizedBox(width: 4),
        Text(rating.toStringAsFixed(1)),
      ],
    );
  }

  Widget _buildBookingButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () => _handleBooking(context),
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
          foregroundColor: Colors.white,
        ),
        child: const Text('Book Now'),
      ),
    );
  }

  void _handleBooking(BuildContext context) async {
    final driverService = Provider.of<DriverService>(context, listen: false);
    final status = await driverService.checkDriverAvailability(driver.id);
    
    if (!context.mounted) return;

    if (status == 'online') {
      _showBookingConfirmation(context);
    } else {
      _showOfflineOptions(context);
    }
  }

  void _showBookingConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Booking'),
        content: Text('Book a ride with ${driver.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement actual booking
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Booking confirmed!')),
              );
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }

  void _showOfflineOptions(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Driver Unavailable'),
        content: const Text('This driver is currently offline.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // TODO: Implement waitlist
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Added to waitlist')),
              );
            },
            child: const Text('Add to Waitlist'),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement similar driver search
              Navigator.pop(context);
            },
            child: const Text('Find Similar'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final difference = DateTime.now().difference(date);
    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else {
      return '${difference.inDays} days ago';
    }
  }
}
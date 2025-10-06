import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../models/driver.dart';
import '../services/driver_service.dart';
import '../utils/app_localizations.dart';
import 'rating_screen.dart';

class DriverDetailsScreen extends StatefulWidget {
  final Driver driver;

  const DriverDetailsScreen({
    super.key,
    required this.driver,
  });

  @override
  State<DriverDetailsScreen> createState() => _DriverDetailsScreenState();
}

class _DriverDetailsScreenState extends State<DriverDetailsScreen> {
  bool _isLoading = false;
  String _driverStatus = 'offline';

  @override
  void initState() {
    super.initState();
    _checkDriverStatus();
  }

  Future<void> _checkDriverStatus() async {
    final driverService = Provider.of<DriverService>(context, listen: false);
    setState(() => _isLoading = true);
    try {
      final status = await driverService.checkDriverAvailability(widget.driver.id);
      if (mounted) {
        setState(() {
          _driverStatus = status;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _showBookingDialog() async {
    final l10n = AppLocalizations.of(context);
    
    if (_driverStatus == 'offline') {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(l10n.driverOffline),
          content: const Text('Would you like to be notified when the driver is available?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(l10n.addToWaitlist),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                final driverService = Provider.of<DriverService>(context, listen: false);
                final similarDrivers = await driverService.findSimilarDrivers(widget.driver);
                if (!mounted) return;
                
                if (similarDrivers.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('No similar drivers found')),
                  );
                } else {
                  _showSimilarDriversDialog(similarDrivers);
                }
              },
              child: Text(l10n.findSimilar),
            ),
          ],
        ),
      );
    } else {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Confirm Booking'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Book a ride with ${widget.driver.name}?'),
              const SizedBox(height: 8),
              Text(
                'Estimated arrival: 5-10 minutes',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
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
  }

  void _showSimilarDriversDialog(List<Driver> similarDrivers) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Similar Drivers'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: similarDrivers.length,
            itemBuilder: (context, index) {
              final driver = similarDrivers[index];
              return ListTile(
                title: Text(driver.name),
                subtitle: Text(driver.carModel),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.star,
                      color: Theme.of(context).primaryColor,
                      size: 18,
                    ),
                    const SizedBox(width: 4),
                    Text(driver.rating.toStringAsFixed(1)),
                  ],
                ),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DriverDetailsScreen(driver: driver),
                    ),
                  );
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildRatingSection(String label, double rating) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.titleSmall,
        ),
        const SizedBox(height: 4),
        RatingBar.builder(
          initialRating: rating,
          minRating: 0,
          direction: Axis.horizontal,
          allowHalfRating: true,
          itemCount: 5,
          itemSize: 20,
          ignoreGestures: true,
          itemBuilder: (context, _) => Icon(
            Icons.star,
            color: Theme.of(context).primaryColor,
          ),
          onRatingUpdate: (_) {},
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.driver.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => RatingScreen(driver: widget.driver),
                ),
              );
              if (result == true) {
                setState(() {});
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              child: Column(
                children: [
                  Text(
                    widget.driver.carModel,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.star,
                        color: Theme.of(context).primaryColor,
                        size: 24,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        widget.driver.rating.toStringAsFixed(1),
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Ratings',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 16),
                  _buildRatingSection(
                    l10n.cleanliness,
                    widget.driver.ratings['cleanliness'] ?? 0,
                  ),
                  const SizedBox(height: 8),
                  _buildRatingSection(
                    l10n.drivingSkill,
                    widget.driver.ratings['driving'] ?? 0,
                  ),
                  const SizedBox(height: 8),
                  _buildRatingSection(
                    l10n.politeness,
                    widget.driver.ratings['politeness'] ?? 0,
                  ),
                  const SizedBox(height: 8),
                  _buildRatingSection(
                    l10n.englishSpeaker,
                    widget.driver.ratings['english'] ?? 0,
                  ),
                  const SizedBox(height: 8),
                  _buildRatingSection(
                    l10n.localExpert,
                    widget.driver.ratings['local_knowledge'] ?? 0,
                  ),
                  if (widget.driver.notes.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Text(
                      l10n.notes,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(widget.driver.notes),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _showBookingDialog,
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                              ),
                            )
                          : Text(_driverStatus == 'online'
                              ? l10n.bookNow
                              : l10n.driverOffline),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
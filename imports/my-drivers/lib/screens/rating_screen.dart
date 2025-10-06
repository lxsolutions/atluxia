import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:provider/provider.dart';
import '../models/driver.dart';
import '../services/driver_service.dart';
import '../utils/app_localizations.dart';

class RatingScreen extends StatefulWidget {
  final Driver? driver; // Null for new ratings
  final String? rideId;

  const RatingScreen({
    super.key,
    this.driver,
    this.rideId,
  });

  @override
  State<RatingScreen> createState() => _RatingScreenState();
}

class _RatingScreenState extends State<RatingScreen> {
  final Map<String, double> _ratings = {
    'cleanliness': 0,
    'driving': 0,
    'politeness': 0,
    'english': 0,
    'local_knowledge': 0,
  };
  
  final _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.driver != null) {
      _ratings.addAll(widget.driver!.ratings);
      _notesController.text = widget.driver!.notes;
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitRating() async {
    if (_ratings.values.any((rating) => rating == 0)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please rate all categories')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final driverService = Provider.of<DriverService>(context, listen: false);
      
      if (widget.driver != null) {
        // Update existing driver rating
        await driverService.updateDriverRating(
          widget.driver!.id,
          _ratings,
        );
      } else {
        // Create new driver rating
        final newDriver = Driver(
          id: widget.rideId ?? DateTime.now().toString(),
          name: 'Driver ${widget.rideId ?? "New"}', // This would come from the ride data
          carModel: 'Unknown', // This would come from the ride data
          rating: _calculateAverageRating(),
          ratings: Map.from(_ratings),
          notes: _notesController.text,
          lastRideDate: DateTime.now(),
        );
        await driverService.saveDriver(newDriver);
      }

      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  double _calculateAverageRating() {
    final sum = _ratings.values.reduce((a, b) => a + b);
    return sum / _ratings.length;
  }

  Widget _buildRatingCategory(String category, String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          RatingBar.builder(
            initialRating: _ratings[category] ?? 0,
            minRating: 0,
            direction: Axis.horizontal,
            allowHalfRating: true,
            itemCount: 5,
            itemSize: 40,
            glow: false,
            itemBuilder: (context, _) => Icon(
              Icons.star,
              color: Theme.of(context).primaryColor,
            ),
            onRatingUpdate: (rating) {
              setState(() {
                _ratings[category] = rating;
              });
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.driver != null ? 'Update Rating' : 'Rate Your Ride'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.driver != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(
                  widget.driver!.name,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
            
            _buildRatingCategory('cleanliness', l10n.cleanliness),
            _buildRatingCategory('driving', l10n.drivingSkill),
            _buildRatingCategory('politeness', l10n.politeness),
            _buildRatingCategory('english', l10n.englishSpeaker),
            _buildRatingCategory('local_knowledge', l10n.localExpert),
            
            const SizedBox(height: 16),
            TextField(
              controller: _notesController,
              maxLength: 100,
              maxLines: 2,
              decoration: InputDecoration(
                labelText: l10n.notes,
                hintText: 'Add optional notes about your experience...',
                border: const OutlineInputBorder(),
              ),
            ),
            
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitRating,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator()
                    : Text(l10n.saveDriver),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
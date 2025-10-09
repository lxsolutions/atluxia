import 'package:flutter/material.dart';
import '../utils/app_localizations.dart';

class DriverFilters extends StatefulWidget {
  final Map<String, bool> activeFilters;
  final Function(Map<String, bool>) onFiltersChanged;
  final String sortBy;
  final Function(String) onSortChanged;

  const DriverFilters({
    super.key,
    required this.activeFilters,
    required this.onFiltersChanged,
    required this.sortBy,
    required this.onSortChanged,
  });

  @override
  State<DriverFilters> createState() => _DriverFiltersState();
}

class _DriverFiltersState extends State<DriverFilters> {
  late Map<String, bool> _filters;
  late String _sortBy;

  @override
  void initState() {
    super.initState();
    _filters = Map.from(widget.activeFilters);
    _sortBy = widget.sortBy;
  }

  void _toggleFilter(String filter) {
    setState(() {
      _filters[filter] = !(_filters[filter] ?? false);
      widget.onFiltersChanged(_filters);
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Text(
                'Sort by:',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(width: 16),
              SegmentedButton<String>(
                segments: [
                  ButtonSegment<String>(
                    value: 'rating',
                    label: Text(l10n.rating),
                    icon: const Icon(Icons.star),
                  ),
                  ButtonSegment<String>(
                    value: 'recent',
                    label: const Text('Recent'),
                    icon: const Icon(Icons.history),
                  ),
                  ButtonSegment<String>(
                    value: 'proximity',
                    label: const Text('Nearby'),
                    icon: const Icon(Icons.location_on),
                  ),
                ],
                selected: {_sortBy},
                onSelectionChanged: (Set<String> selection) {
                  setState(() {
                    _sortBy = selection.first;
                    widget.onSortChanged(_sortBy);
                  });
                },
              ),
            ],
          ),
        ),
        const Divider(),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.preferredTraits,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  FilterChip(
                    label: Text(l10n.nonSmoker),
                    selected: _filters['non_smoker'] ?? false,
                    onSelected: (_) => _toggleFilter('non_smoker'),
                  ),
                  FilterChip(
                    label: Text(l10n.englishSpeaker),
                    selected: _filters['english_speaker'] ?? false,
                    onSelected: (_) => _toggleFilter('english_speaker'),
                  ),
                  FilterChip(
                    label: Text(l10n.localExpert),
                    selected: _filters['local_expert'] ?? false,
                    onSelected: (_) => _toggleFilter('local_expert'),
                  ),
                  FilterChip(
                    label: Text(l10n.quiet),
                    selected: _filters['quiet'] ?? false,
                    onSelected: (_) => _toggleFilter('quiet'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
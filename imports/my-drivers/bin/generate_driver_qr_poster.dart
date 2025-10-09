











import 'package:args/args.dart';
import '../lib/marketing/driver_qr_poster/qr_poster_generator.dart';

void main(List<String> arguments) async {
  final parser = ArgParser()
    ..addOption('driver-id', abbr: 'd', help: 'Driver ID to generate poster for')
    .addOption('output', abbr: 'o', help: 'Output file path');

  final args = parser.parse(arguments);

  if (args['driver-id'] == null) {
    print('Error: --driver-id is required');
    return;
  }

  try {
    final driverId = args['driver-id'];
    final posterGenerator = QRPosterGenerator(driverId);
    final pdf = await posterGenerator.generate();

    // Save to file
    final outputPath = args['output'] ?? 'driver_${driverId}_qr_poster.pdf';
    print('Generating $outputPath...');
    await Printing.savePdf(
      filename: outputPath,
      document: pdf,
    );
    print('Poster generated successfully at $outputPath');

  } catch (e) {
    print('Error generating poster: $e');
  }
}












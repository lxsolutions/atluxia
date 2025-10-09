




import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    // Load mock data for development (temporarily)
    Future.microtask(() =>
      Provider.of<DriverService>(context, listen: false).loadMockDrivers()
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Drivers'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Map', icon: Icon(Icons.map)),
            Tab(text: 'Drivers', icon: Icon(Icons.people)),
            Tab(text: 'Messages', icon: Icon(Icons.message)),
            Tab(text: 'Settings', icon: Icon(Icons.settings)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          MapTab(),
          MyDriversTab(),
          MessagesTab(),
          SettingsScreen(),
        ],
      ),
    );
  }
}

class MapTab extends StatelessWidget {
  const MapTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text('Map tab - Show saved drivers with status=accepted & online=true'),
    );
  }
}

class MyDriversTab extends StatefulWidget {
  const MyDriversTab({super.key});

  @override
  State<MyDriversTab> createState() => _MyDriversTabState();
}

class _MyDriversTabState extends State<MyDriversTab> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: const DriverList(sortBy: 'rating'),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to QR scanner
        },
        child: const Icon(Icons.qr_code_scanner),
      ),
    );
  }
}

class MessagesTab extends StatelessWidget {
  const MessagesTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text('Messages tab - Show active rides chat'),
    );
  }
}





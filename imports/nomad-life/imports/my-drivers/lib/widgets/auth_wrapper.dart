



import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../screens/auth/login_screen.dart';
import '../screens/home_screen.dart';
import '../widgets/auth_gate.dart';

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return AuthGate(
      authenticatedChild: const HomeScreen(),
      unauthenticatedChild: const LoginScreen(),
    );
  }
}



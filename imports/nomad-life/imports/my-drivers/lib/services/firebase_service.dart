import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class FirebaseService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Authentication methods
  static Future<UserCredential> signInWithEmail(String email, String password) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  static Future<UserCredential> signUpWithEmail(String email, String password) async {
    try {
      return await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  static Future<void> signOut() async {
    await _auth.signOut();
  }

  // Firestore methods
  static Future<void> saveDriver(String userId, Map<String, dynamic> driverData) async {
    await _db.collection('users')
        .doc(userId)
        .collection('saved_drivers')
        .doc(driverData['id'])
        .set(driverData);
  }

  static Future<List<Map<String, dynamic>>> getSavedDrivers(String userId) async {
    final snapshot = await _db.collection('users')
        .doc(userId)
        .collection('saved_drivers')
        .get();
    
    return snapshot.docs.map((doc) => doc.data()).toList();
  }

  static Future<void> updateDriverRating(
    String userId, 
    String driverId, 
    Map<String, dynamic> ratings
  ) async {
    await _db.collection('users')
        .doc(userId)
        .collection('saved_drivers')
        .doc(driverId)
        .update({'ratings': ratings});
  }

  static Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Error handling
  static String _handleAuthError(dynamic error) {
    String message;
    switch (error.code) {
      case 'email-already-in-use':
        message = 'This email is already registered.';
        break;
      case 'invalid-email':
        message = 'The email address is invalid.';
        break;
      case 'operation-not-allowed':
        message = 'Email/password accounts are not enabled.';
        break;
      case 'weak-password':
        message = 'Please enter a stronger password.';
        break;
      case 'user-disabled':
        message = 'This account has been disabled.';
        break;
      case 'user-not-found':
        message = 'No account found with this email.';
        break;
      case 'wrong-password':
        message = 'Incorrect password.';
        break;
      default:
        message = 'An error occurred. Please try again.';
    }
    return message;
  }
}
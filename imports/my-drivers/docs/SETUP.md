

# My Drivers - Local Setup Guide

## Prerequisites

- Flutter SDK (3.16.x or higher)
- Dart SDK
- Android Studio with Android emulator configured
- Xcode and iOS simulator (macOS only)

## Environment Configuration

1. Create a `.env` file in the `env/` directory by copying the example:
   ```bash
   cp env/.env.example env/.env
   ```

2. Fill in your configuration values for Supabase, Firebase, Google Maps API, and Dynamic Links.

## Android Setup

### 1. Configure Gradle Properties

Edit `android/gradle.properties` to include:

```properties
org.gradle.jvmargs=-Xmx1536M
android.useAndroidX=true
android.enableJetifier=true
```

### 2. Update build.gradle Files

**Project-level `build.gradle` (`android/build.gradle`):**

```groovy
buildscript {
    ext.kotlin_version = '1.9.0'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
        classpath 'com.google.gms:google-services:4.3.15' // Add this line
    }
}
```

**App-level `build.gradle` (`android/app/build.gradle`):**

```groovy
apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'
apply plugin: 'com.google.gms.google-services' // Add this line

android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.example.my_drivers"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        multiDexEnabled true // Add this line for multidex support
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation "org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version"
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-analytics-ktx'
    implementation 'com.android.support:multidex:1.0.3' // Add this line
}
```

### 3. Configure Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Register your app with package name `com.example.my_drivers`
4. Download `google-services.json` and place it in `android/app/`

### 4. Configure Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Maps SDK for Android" and "Places API"
4. Get an API key and add it to your `.env` file

## iOS Setup (macOS only)

### 1. Configure Podfile

Edit `ios/Podfile`:

```ruby
platform :ios, '12.0'
require_relative '../.symlinks/plugins/firebase_core/ios/FirebaseCoreVersion.frbinc'
require_relative '../.symlinks/plugins/firebase_messaging/ios/FirebaseMessagingVersion.frbinc'

target 'Runner' do
  use_frameworks!
  use_modular_headers!

  # Pods for Runner
  pod 'Firebase/Core', FirebaseCoreVersion.nsString
  pod 'Firebase/Messaging', FirebaseMessagingVersion.nsString

  target 'RunnerTests' do
    inherit! :search_paths
  end
end
```

### 2. Install CocoaPods Dependencies

```bash
cd ios
pod install --repo-update
cd ..
```

## Running the App

### Android Emulator

1. Start an Android emulator from Android Studio
2. Run the app:

   ```bash
   flutter run -t lib/main.dart
   ```

### iOS Simulator (macOS only)

1. Start an iOS simulator from Xcode
2. Run the app:

   ```bash
   flutter run -t lib/main.dart --release
   ```

## Troubleshooting

- **Missing dependencies**: Run `flutter pub get`
- **Gradle sync issues**: Clean and rebuild in Android Studio
- **Firebase initialization errors**: Verify `google-services.json` is properly configured
- **Google Maps API errors**: Check your API key has the correct permissions enabled

For any setup issues, please open a GitHub issue with details about your environment and error messages.

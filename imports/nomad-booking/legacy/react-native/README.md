

# Legacy React Native Frontend

This directory contains the original React Native frontend for the booking application. The code has been archived as part of the migration to a TypeScript-first monorepo using Turborepo.

## Migration Details

The project has been migrated from a React Native mobile app to a Next.js-based web platform with the following goals:

1. **Target Audience**: Shift focus from general booking to long-stay accommodations for digital nomads (14-180 nights)
2. **Technology Stack**: Move from React Native to Next.js 15 with TypeScript, Tailwind CSS, and shadcn/ui
3. **Architecture**: Implement a monorepo structure using Turborepo
4. **SEO & Performance**: Leverage SSR and SEO-first approach for better discoverability

## Original Codebase

The original React Native code was built with:
- React Native 0.78.1
- TypeScript 5.0.4
- Navigation using @react-navigation/native and @react-navigation/stack

## Migration Rationale

The migration to Next.js provides several advantages for our target audience:
- Better SEO for search engine visibility
- Web-first experience with optional PWA capabilities
- Easier integration with modern web APIs
- Consistent performance across devices
- Support for complex routing and internationalization

## Accessing Legacy Code

To run the original React Native app:

```bash
cd legacy/react-native/BookingAppFrontend
npm install
npx react-native start
```

For Android:
```bash
npx react-native run-android
```

For iOS (macOS required):
```bash
npx react-native run-ios
```

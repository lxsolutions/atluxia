








# Onboarding Agent

The OnboardingAgent guides new users through key creation, profile setup, and bundle selection.

## Features
- Step-by-step user onboarding flow
- DID Key generation (initial implementation)
- Profile configuration assistance
- Algorithm bundle recommendations
- Integration with PolyVerse web client

## Implementation Details
- **Language**: TypeScript/React for web integration
- **API Endpoints**:
  - `/onboard/init` - Start onboarding process
  - `/onboard/create-did` - Generate DID Key
  - `/onboard/select-bundle` - Bundle recommendation and selection

## Safety Notes
- Never store user keys server-side
- Use client-side encryption for sensitive data
- Provide clear instructions about key backup









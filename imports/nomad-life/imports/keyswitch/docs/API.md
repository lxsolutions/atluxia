





# Keyswitch API Reference

This document provides an overview of the Keyswitch API endpoints.

## Authentication

### JWT Authentication
All protected endpoints require a valid JWT token in the `Authorization` header.

**Example:**
```
GET /api/v1/users/me
Authorization: Bearer <token>
```

## Users

### Get Current User
```http
GET /api/v1/users/me
```

#### Response
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "guest" | "host"
}
```

## Vehicles

### Get Vehicle Details
```http
GET /api/v1/vehicles/{vehicleId}
```

#### Response
```json
{
  "id": "string",
  "make": "string",
  "model": "string",
  "year": number,
  "licensePlate": "string",
  "vin": "string",
  "photos": ["string"],
  "attributes": {
    "evRange": number,
    "hitchRating": string,
    "childSeats": boolean
  }
}
```

## Listings

### Search Listings
```http
GET /api/v1/listings/search
```

#### Query Parameters
- `location`: Location query (address, airport code)
- `startDate`: Start date in YYYY-MM-DD format
- `endDate`: End date in YYYY-MM-DD format
- `filters`: JSON string with filters (EV, racks, etc.)

## Bookings

### Create Booking
```http
POST /api/v1/bookings
```

#### Request Body
```json
{
  "listingId": "string",
  "startDate": "YYYY-MM-DDTHH:MM:SSZ",
  "endDate": "YYYY-MM-DDTHH:MM:SSZ",
  "guestId": "string"
}
```

## Payments

### Create Payment Intent
```http
POST /api/v1/payments/intents
```

#### Request Body
```json
{
  "amount": number,
  "currency": "usd",
  "bookingId": "string"
}
```

## Risk Assessment

### Get Risk Score for Trip
```http
GET /api/v1/risk/trip/{tripId}/score
```

#### Response
```json
{
  "riskBand": "low" | "medium" | "high",
  "suggestedDeposit": number,
  "priceMultiplier": number
}
```

## Claims

### Create Claim
```http
POST /api/v1/claims
```

#### Request Body
```json
{
  "bookingId": "string",
  "description": "string",
  "photos": ["string"],
  "damageDescription": "string"
}
`




















-- Migration to create audit logs table for airport compliance
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" SERIAL PRIMARY KEY,
  "event_type" VARCHAR(50) NOT NULL, -- e.g., 'airport_pickup', 'airport_dropoff'
  "user_id" INTEGER REFERENCES "User"(id),
  "vehicle_id" INTEGER REFERENCES "Vehicle"(id),
  "listing_id" INTEGER REFERENCES "Listing"(id),
  "booking_id" INTEGER REFERENCES "Booking"(id),
  "airport_code" VARCHAR(10) NOT NULL,
  "location" GEOGRAPHY(Point, 4326), -- Geo-coordinates of the event
  "metadata" JSONB, -- Additional data like vehicle condition, fees collected
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for faster queries by airport and event type
CREATE INDEX IF NOT EXISTS idx_audit_log_airport_event ON "AuditLog"(airport_code, event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_location ON "AuditLog" USING GIST(location);
















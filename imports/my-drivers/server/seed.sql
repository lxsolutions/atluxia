
-- My Drivers - Database Seed Script
-- This script creates sample data for local development and testing

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert a rider profile
INSERT INTO profiles (id, role, name, phone, photo_url) VALUES (
  uuid_generate_v4(),
  'rider',
  'John Doe',
  '+66812345678',
  'https://example.com/photos/john_doe.jpg'
);

-- Insert a driver profile
INSERT INTO profiles (id, role, name, phone, photo_url) VALUES (
  uuid_generate_v4(),
  'driver',
  'Somsak Srisuwan',
  '+66891234567',
  'https://example.com/photos/somsak.jpg'
);

-- Insert a vehicle for the driver
INSERT INTO vehicles (id, driver_id, make, model, year) VALUES (
  uuid_generate_v4(),
  (SELECT id FROM profiles WHERE name = 'Somsak Srisuwan' AND role = 'driver'),
  'Toyota',
  'Camry',
  2018
);

-- Create a saved_drivers relationship (accepted)
INSERT INTO saved_drivers (rider_id, driver_id, status) VALUES (
  (SELECT id FROM profiles WHERE name = 'John Doe' AND role = 'rider'),
  (SELECT id FROM profiles WHERE name = 'Somsak Srisuwan' AND role = 'driver'),
  'accepted'
);

-- Insert a sample ride
INSERT INTO rides (id, rider_id, driver_id, status) VALUES (
  uuid_generate_v4(),
  (SELECT id FROM profiles WHERE name = 'John Doe' AND role = 'rider'),
  (SELECT id FROM profiles WHERE name = 'Somsak Srisuwan' AND role = 'driver'),
  'completed'
);

-- Insert a driver status entry
INSERT INTO driver_status (driver_id, online) VALUES (
  (SELECT id FROM profiles WHERE name = 'Somsak Srisuwan' AND role = 'driver'),
  true
);

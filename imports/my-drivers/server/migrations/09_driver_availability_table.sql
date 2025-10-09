

-- Create driver availability table for scheduling
CREATE TABLE IF NOT EXISTS driver_availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  dow integer CHECK (dow >= 0 AND dow <= 6), -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_minute integer CHECK (start_minute >= 0 AND start_minute < 1440),
  end_minute integer CHECK (end_minute > start_minute AND end_minute <= 1440),
  timezone text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS policy for driver_availability
CREATE POLICY "Drivers can manage their own availability" ON driver_availability
  FOR SELECT USING (auth.role() = 'driver' AND profiles.id = driver_id)
    OR (auth.role() = 'rider')
  FOR INSERT USING (auth.role() = 'driver' AND profiles.id = driver_id)
  FOR UPDATE USING (auth.role() = 'driver' AND profiles.id = driver_id)
  FOR DELETE USING (auth.role() = 'driver' AND profiles.id = driver_id);


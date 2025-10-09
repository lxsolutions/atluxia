


-- Create ride scheduling table
CREATE TABLE IF NOT EXISTS ride_scheduling (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_time timestamp with time zone NOT NULL,
  status text CHECK (status IN ('scheduled', 'accepted', 'declined', 'completed', 'cancelled')) DEFAULT 'scheduled',
  pickup_location jsonb,
  dropoff_location jsonb,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS policy for ride_scheduling
CREATE POLICY "Riders can manage their scheduled rides" ON ride_scheduling
  FOR SELECT USING (auth.role() = 'rider' AND profiles.id = rider_id)
    OR (auth.role() = 'driver')
  FOR INSERT USING (auth.role() = 'rider' AND profiles.id = rider_id)
  FOR UPDATE USING ((auth.role() = 'rider' AND profiles.id = rider_id) OR
                   (auth.role() = 'driver' AND profiles.id = driver_id))
  FOR DELETE USING (auth.role() = 'rider' AND profiles.id = rider_id);



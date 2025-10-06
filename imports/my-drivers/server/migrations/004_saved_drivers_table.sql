










-- Migration to create saved_drivers table
CREATE TABLE IF NOT EXISTS saved_drivers (
  rider_id uuid REFERENCES profiles(id),
  driver_id uuid REFERENCES profiles(id),
  status text CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (rider_id, driver_id)
);

-- RLS policy for saved_drivers
CREATE POLICY "saved_drivers_insert_policy" ON saved_drivers
  FOR INSERT USING (
    auth.role() = 'rider' AND rider_id = auth.uid()
  );

CREATE POLICY "saved_drivers_update_policy" ON saved_drivers
  FOR UPDATE USING (
    (auth.role() = 'driver' AND driver_id = auth.uid()) OR
    (auth.role() = 'rider' AND rider_id = auth.uid())
  );

CREATE POLICY "saved_drivers_select_policy" ON saved_drivers
  FOR SELECT USING (
    auth.role() IN ('rider', 'driver') AND
    (rider_id = auth.uid() OR driver_id = auth.uid())
  );






















-- Migration to create rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY,
  rider_id uuid REFERENCES profiles(id),
  driver_id uuid REFERENCES profiles(id),
  status text CHECK (status IN ('requested', 'accepted', 'enroute', 'ongoing', 'completed', 'canceled')) DEFAULT 'requested',
  origin geography(Point,4326),
  dest geography(Point,4326),
  price_quote numeric,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS policy for rides
CREATE POLICY "rides_insert_policy" ON rides
  FOR INSERT USING (auth.role() = 'rider' AND rider_id = auth.uid());

CREATE POLICY "rides_update_policy" ON rides
  FOR UPDATE USING (
    (auth.role() = 'driver' AND driver_id = auth.uid()) OR
    (auth.role() = 'rider' AND rider_id = auth.uid())
  );

CREATE POLICY "rides_select_policy" ON rides
  FOR SELECT USING (
    auth.role() IN ('rider', 'driver') AND
    (rider_id = auth.uid() OR driver_id = auth.uid())
  );











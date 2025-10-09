










-- Migration to create ride_events table
CREATE TABLE IF NOT EXISTS ride_events (
  id bigserial PRIMARY KEY,
  ride_id uuid REFERENCES rides(id),
  ts timestamptz DEFAULT now(),
  type text,
  payload jsonb
);

-- RLS policy for ride_events
CREATE POLICY "ride_events_insert_policy" ON ride_events
  FOR INSERT USING (
    auth.role() IN ('rider', 'driver') AND EXISTS (
      SELECT 1 FROM rides WHERE id = ride_id AND (rider_id = auth.uid() OR driver_id = auth.uid())
    )
  );

CREATE POLICY "ride_events_select_policy" ON ride_events
  FOR SELECT USING (
    auth.role() IN ('rider', 'driver') AND EXISTS (
      SELECT 1 FROM rides WHERE id = ride_id AND (rider_id = auth.uid() OR driver_id = auth.uid())
    )
  );











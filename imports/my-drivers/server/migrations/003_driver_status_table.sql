










-- Migration to create driver_status table
CREATE TABLE IF NOT EXISTS driver_status (
  driver_id uuid PRIMARY KEY REFERENCES profiles(id),
  online bool DEFAULT false,
  lat double precision,
  lng double precision,
  heading double precision,
  updated_at timestamptz
);

-- RLS policy for driver_status
CREATE POLICY "driver_status_upsert_policy" ON driver_status
  FOR INSERT, UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "driver_status_select_policy" ON driver_status
  FOR SELECT USING (
    auth.role() IN ('rider', 'driver') AND
    driver_id IN (
      SELECT driver_id FROM saved_drivers WHERE rider_id = auth.uid() AND status = 'accepted'
    )
  );


















-- Migration to create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY,
  driver_id uuid REFERENCES profiles(id),
  make text,
  model text,
  year int,
  plate text,
  color text,
  amenities jsonb DEFAULT '[]'::jsonb
);

-- RLS policy for vehicles
CREATE POLICY "vehicles_select_policy" ON vehicles
  FOR SELECT USING (
    driver_id IN (SELECT id FROM profiles WHERE role = 'driver')
  );

CREATE POLICY "vehicles_insert_update_policy" ON vehicles
  FOR INSERT, UPDATE USING (auth.uid() = driver_id);






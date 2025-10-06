







-- Migration to create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  role text CHECK (role IN ('rider', 'driver')),
  name text,
  phone text,
  photo_url text,
  rating_avg float DEFAULT 0.0,
  rating_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS policy for profiles
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (true)
  WITH CHECK (
    auth.role() = 'rider' AND id IN (
      SELECT driver_id FROM saved_drivers WHERE rider_id = auth.uid() AND status = 'accepted'
    ) OR
    auth.role() = 'driver' AND id IN (
      SELECT rider_id FROM saved_drivers WHERE driver_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);

INSERT INTO profiles (id, role) VALUES ('authenticated', 'driver') -- For testing


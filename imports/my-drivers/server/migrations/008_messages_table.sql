











-- Migration to create messages table
CREATE TABLE IF NOT EXISTS messages (
  id bigserial PRIMARY KEY,
  ride_id uuid REFERENCES rides(id),
  sender_id uuid REFERENCES profiles(id),
  text text,
  sent_at timestamptz DEFAULT now()
);

-- RLS policy for messages
CREATE POLICY "messages_insert_policy" ON messages
  FOR INSERT USING (
    auth.role() IN ('rider', 'driver') AND EXISTS (
      SELECT 1 FROM rides WHERE id = ride_id AND (rider_id = auth.uid() OR driver_id = auth.uid())
    )
  );

CREATE POLICY "messages_select_policy" ON messages
  FOR SELECT USING (
    auth.role() IN ('rider', 'driver') AND EXISTS (
      SELECT 1 FROM rides WHERE id = ride_id AND (rider_id = auth.uid() OR driver_id = auth.uid())
    )
  );












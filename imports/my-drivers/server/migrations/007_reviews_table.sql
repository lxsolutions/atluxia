










-- Migration to create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id bigserial PRIMARY KEY,
  ride_id uuid REFERENCES rides(id),
  rider_id uuid REFERENCES profiles(id),
  driver_id uuid REFERENCES profiles(id),
  stars_cleanliness int CHECK (stars_cleanliness BETWEEN 1 AND 5),
  stars_driving int CHECK (stars_driving BETWEEN 1 AND 5),
  stars_politeness int CHECK (stars_politeness BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- RLS policy for reviews
CREATE POLICY "reviews_insert_policy" ON reviews
  FOR INSERT USING (
    auth.role() = 'rider' AND rider_id = auth.uid() AND EXISTS (
      SELECT 1 FROM rides WHERE id = ride_id AND status IN ('completed', 'canceled') AND rider_id = auth.uid()
    )
  );

CREATE POLICY "reviews_select_policy" ON reviews
  FOR SELECT USING (
    auth.role() IN ('rider', 'driver') AND EXISTS (
      SELECT 1 FROM rides WHERE id = ride_id AND (rider_id = auth.uid() OR driver_id = auth.uid())
    )
  );











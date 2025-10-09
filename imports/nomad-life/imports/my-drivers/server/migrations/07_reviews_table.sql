










-- Migration to create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    stars_cleanliness INTEGER CHECK (stars_cleanliness BETWEEN 1 AND 5),
    stars_driving INTEGER CHECK (stars_driving BETWEEN 1 AND 5),
    stars_politeness INTEGER CHECK (stars_politeness BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policy for reviews table
CREATE POLICY "Reviews: readable by the ride participants only"
    ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rides
            WHERE rides.id = ride_id AND (rides.rider_id = auth.uid() OR rides.driver_id = auth.uid())
        )
    );

-- Allow riders to insert reviews for completed rides they took
CREATE POLICY "Reviews: riders can add reviews for their completed rides"
    ON reviews
    FOR INSERT USING (
        rider_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM rides
            WHERE rides.id = ride_id
              AND rides.rider_id = auth.uid()
              AND rides.status IN ('completed')
        )
    );





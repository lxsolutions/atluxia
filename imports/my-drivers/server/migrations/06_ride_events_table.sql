







-- Migration to create ride_events table
CREATE TABLE IF NOT EXISTS ride_events (
    id BIGSERIAL PRIMARY KEY,
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ DEFAULT now(),
    type TEXT,
    payload JSONB
);

-- RLS policy for ride_events table
CREATE POLICY "Ride events: readable by the ride participants only"
    ON ride_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rides
            WHERE rides.id = ride_id AND (rides.rider_id = auth.uid() OR rides.driver_id = auth.uid())
        )
    );




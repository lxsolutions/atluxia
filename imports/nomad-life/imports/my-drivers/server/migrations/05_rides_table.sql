





-- Migration to create rides table
CREATE TABLE IF NOT EXISTS rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('requested', 'accepted', 'enroute', 'ongoing', 'completed', 'canceled')) DEFAULT 'requested',
    origin GEOGRAPHY(Point, 4326),
    dest GEOGRAPHY(Point, 4326),
    price_quote NUMERIC,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policy for rides table
CREATE POLICY "Rides: readable by the ride participants only"
    ON rides
    FOR SELECT USING (
        rider_id = auth.uid() OR driver_id = auth.uid()
    );




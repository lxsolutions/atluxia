


-- Migration to create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    make TEXT,
    model TEXT,
    year INTEGER,
    plate TEXT UNIQUE,
    color TEXT,
    amenities JSONB
);

-- RLS policy for vehicles table
CREATE POLICY "Vehicles: drivers can manage their own vehicles"
    ON vehicles
    FOR SELECT, INSERT, UPDATE USING (auth.uid() = driver_id)
    WITH CHECK (driver_id = auth.uid());


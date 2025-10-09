



-- Migration to create driver_status table
CREATE TABLE IF NOT EXISTS driver_status (
    driver_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    online BOOLEAN DEFAULT FALSE,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    updated_at TIMESTAMPTZ
);

-- RLS policy for driver_status table
CREATE POLICY "Driver status: driver can upsert own row"
    ON driver_status
    FOR SELECT, INSERT, UPDATE USING (auth.uid() = driver_id)
    WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Driver status: riders can read rows for drivers they have saved (status accepted)"
    ON driver_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM saved_drivers
            WHERE saved_drivers.rider_id = auth.uid()
              AND saved_drivers.driver_id = driver_id
              AND saved_drivers.status = 'accepted'
        )
    );








-- Migration to create saved_drivers table
CREATE TABLE IF NOT EXISTS saved_drivers (
    rider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (rider_id, driver_id)
);

-- RLS policy for saved_drivers table
CREATE POLICY "Saved drivers: a rider can insert (pending)"
    ON saved_drivers
    FOR INSERT USING (auth.uid() = rider_id)
    WITH CHECK (rider_id = auth.uid());

CREATE POLICY "Saved drivers: only the driver can update to 'accepted' or 'blocked'"
    ON saved_drivers
    FOR UPDATE USING (
        (auth.role() = 'driver' AND driver_id = auth.uid())
    )
    WITH CHECK (
        (status IN ('pending', 'accepted') OR status != 'pending')
    );

CREATE POLICY "Saved drivers: each can select rows involving themselves"
    ON saved_drivers
    FOR SELECT USING (
        rider_id = auth.uid() OR driver_id = auth.uid()
    );



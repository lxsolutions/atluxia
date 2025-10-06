

-- Migration to create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT CHECK (role IN ('rider', 'driver')),
    name TEXT,
    phone TEXT UNIQUE,
    photo_url TEXT,
    rating_avg FLOAT DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policy for profiles table
CREATE POLICY "Profiles: users can select own row" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles: riders/drivers can read public fields of drivers they have saved and vice versa"
    ON profiles
    FOR SELECT USING (
        auth.role() IN ('driver', 'rider') AND
        EXISTS (
            SELECT 1 FROM saved_drivers
            WHERE (saved_drivers.rider_id = auth.uid() AND saved_drivers.driver_id = id) OR
                  (saved_drivers.driver_id = auth.uid() AND saved_drivers.rider_id = id)
        )
    );

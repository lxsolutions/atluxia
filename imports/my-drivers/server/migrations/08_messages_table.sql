










-- Migration to create messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    text TEXT,
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policy for messages table
CREATE POLICY "Messages: readable by the ride participants only"
    ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rides
            WHERE rides.id = ride_id AND (rides.rider_id = auth.uid() OR rides.driver_id = auth.uid())
        )
    );

-- Allow any participant to send messages during active rides
CREATE POLICY "Messages: participants can send messages"
    ON messages
    FOR INSERT USING (
        EXISTS (
            SELECT 1 FROM rides
            WHERE rides.id = ride_id AND (rides.rider_id = auth.uid() OR rides.driver_id = auth.uid())
              AND rides.status IN ('requested', 'accepted', 'enroute', 'ongoing')
        )
    );






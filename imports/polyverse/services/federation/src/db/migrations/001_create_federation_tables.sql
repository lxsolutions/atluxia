-- Create federation tables

-- Federation outbox for activities to be delivered
CREATE TABLE IF NOT EXISTS federation_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    object JSONB NOT NULL,
    target TEXT,
    delivered BOOLEAN DEFAULT FALSE,
    delivery_attempts INTEGER DEFAULT 0,
    last_delivery_attempt TIMESTAMP,
    delivery_error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Federation inbox for received activities
CREATE TABLE IF NOT EXISTS federation_inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    object JSONB NOT NULL,
    target TEXT,
    processed BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Known federation instances
CREATE TABLE IF NOT EXISTS federation_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT UNIQUE NOT NULL,
    actor_url TEXT,
    inbox_url TEXT,
    shared_inbox_url TEXT,
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Followers for federation
CREATE TABLE IF NOT EXISTS federation_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT NOT NULL,
    target_user TEXT NOT NULL,
    accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(actor, target_user)
);

-- Transparency records for federation activities
CREATE TABLE IF NOT EXISTS federation_transparency_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type TEXT NOT NULL,
    activity_id TEXT,
    actor TEXT,
    target_instance TEXT,
    decision TEXT,
    features JSONB,
    explanation JSONB,
    bundle_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_federation_outbox_delivered ON federation_outbox(delivered);
CREATE INDEX IF NOT EXISTS idx_federation_outbox_created_at ON federation_outbox(created_at);
CREATE INDEX IF NOT EXISTS idx_federation_inbox_processed ON federation_inbox(processed);
CREATE INDEX IF NOT EXISTS idx_federation_inbox_created_at ON federation_inbox(created_at);
CREATE INDEX IF NOT EXISTS idx_federation_followers_actor ON federation_followers(actor);
CREATE INDEX IF NOT EXISTS idx_federation_followers_target_user ON federation_followers(target_user);
CREATE INDEX IF NOT EXISTS idx_federation_transparency_records_created_at ON federation_transparency_records(created_at);
CREATE INDEX IF NOT EXISTS idx_federation_transparency_records_record_type ON federation_transparency_records(record_type);
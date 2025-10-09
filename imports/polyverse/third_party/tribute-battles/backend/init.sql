










-- Create database if it doesn't exist
-- This is handled by the Docker entrypoint, but we can add additional setup here

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user for the application if it doesn't exist
-- This is also handled by Docker, but we can add additional setup

-- Set up initial data if needed
-- For example, create default games, dispute categories, etc.

-- Example: Insert default games
INSERT INTO games (name, description, game_type, max_players, created_at) VALUES
('Age of Empires II', 'Classic real-time strategy game', 'RTS', 4, NOW()),
('StarCraft II', 'Fast-paced competitive RTS', 'RTS', 2, NOW()),
('Civilization VI', 'Turn-based strategy game', 'TBS', 2, NOW())
ON CONFLICT (name) DO NOTHING;

-- Example: Insert default dispute categories
INSERT INTO dispute_categories (name, description, created_at) VALUES
('Religion', 'Disputes about religious beliefs and practices', NOW()),
('Strategy', 'Disputes about gaming strategies and tactics', NOW()),
('Technology', 'Disputes about technology and innovation', NOW())
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON disputes(created_at);
CREATE INDEX IF NOT EXISTS idx_matches_dispute_id ON matches(dispute_id);

-- Grant permissions (if needed)
-- This is typically handled by the Docker entrypoint

-- Add any other initial setup here
-- For example, create default admin user, set up initial configuration, etc.

-- Note: This script runs every time the container starts
-- Make sure it's idempotent (can run multiple times without issues)










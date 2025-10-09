-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create schema for GAM
CREATE SCHEMA IF NOT EXISTS gam;

-- Set search path
SET search_path TO gam, public;
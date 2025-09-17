-- Add logo support to business tables
-- Migration: Add logo_url field for business logos

-- Add logo_url field to businesses table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN
        ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;
    END IF;
END $$;

-- Add logo_url field to clients table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_url TEXT;
    END IF;
END $$;

-- Add logo_url field to business_profiles table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_profiles') THEN
        ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;
    END IF;
END $$;

-- Create storage bucket for business logos if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-logos', 'business-logos', true) 
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for business logos bucket
INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES 
('business-logos', '.emptyFolderPlaceholder', null, '{}') 
ON CONFLICT DO NOTHING;
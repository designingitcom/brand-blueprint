-- Add business status enum and column
-- Migration to align database schema with business status logic

-- Create business status enum
CREATE TYPE business_status_enum AS ENUM ('active', 'pending', 'onboarding', 'inactive', 'suspended');

-- Add status column to businesses table
ALTER TABLE businesses 
ADD COLUMN status business_status_enum DEFAULT 'onboarding';

-- Update existing businesses based on onboarding completion
UPDATE businesses 
SET status = CASE 
    WHEN onboarding_completed = true THEN 'active'::business_status_enum
    ELSE 'onboarding'::business_status_enum
END;

-- Add index for performance
CREATE INDEX idx_businesses_status ON businesses(status);

-- Update RLS policy to include status in accessible fields
-- (The existing policy already covers access, no changes needed)
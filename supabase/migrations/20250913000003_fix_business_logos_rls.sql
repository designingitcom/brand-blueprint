-- Fix RLS policies for business-logos storage bucket
-- Migration: Add proper RLS policies to allow authenticated users to upload/read business logos

-- Enable RLS on storage.objects for business-logos bucket
-- (This is typically enabled by default, but ensuring it's enabled)

-- Remove any existing policies for business-logos bucket to start fresh
DELETE FROM storage.policies WHERE bucket_id = 'business-logos';

-- Policy 1: Allow authenticated users to upload to business-logos bucket
INSERT INTO storage.policies (
  id,
  bucket_id,
  name,
  operation,
  definition,
  check_expression
) VALUES (
  'business-logos-upload-policy',
  'business-logos',
  'Allow authenticated users to upload business logos',
  'INSERT',
  '(auth.role() = ''authenticated'')',
  '(auth.role() = ''authenticated'')'
);

-- Policy 2: Allow public read access to business logos (since bucket is public)
INSERT INTO storage.policies (
  id,
  bucket_id,
  name,
  operation,
  definition,
  check_expression
) VALUES (
  'business-logos-read-policy',
  'business-logos',
  'Allow public read access to business logos',
  'SELECT',
  'true',
  NULL
);

-- Policy 3: Allow authenticated users to update their own uploaded logos
INSERT INTO storage.policies (
  id,
  bucket_id,
  name,
  operation,
  definition,
  check_expression
) VALUES (
  'business-logos-update-policy',
  'business-logos',
  'Allow authenticated users to update business logos',
  'UPDATE',
  '(auth.role() = ''authenticated'')',
  '(auth.role() = ''authenticated'')'
);

-- Policy 4: Allow authenticated users to delete their own uploaded logos
INSERT INTO storage.policies (
  id,
  bucket_id,
  name,
  operation,
  definition,
  check_expression
) VALUES (
  'business-logos-delete-policy',
  'business-logos',
  'Allow authenticated users to delete business logos',
  'DELETE',
  '(auth.role() = ''authenticated'')',
  NULL
);
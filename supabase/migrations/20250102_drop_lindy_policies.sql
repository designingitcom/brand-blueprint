-- Drop all existing policies on lindy_responses table
-- Run this FIRST if you get "policy already exists" errors

DROP POLICY IF EXISTS "Users can view their Lindy responses" ON lindy_responses;
DROP POLICY IF EXISTS "Service role can manage Lindy responses" ON lindy_responses;
DROP POLICY IF EXISTS "Service role can insert Lindy responses" ON lindy_responses;
DROP POLICY IF EXISTS "Service role can update Lindy responses" ON lindy_responses;

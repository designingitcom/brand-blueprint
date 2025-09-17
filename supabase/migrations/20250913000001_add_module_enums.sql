-- Add module type and category ENUMs
-- Migration: Add proper ENUMs for module_type and category fields

-- Create module type enum
CREATE TYPE module_type_enum AS ENUM ('standard', 'onboarding', 'assessment', 'custom');

-- Create module category enum  
CREATE TYPE module_category_enum AS ENUM ('foundation', 'strategy', 'brand', 'marketing', 'operations', 'finance', 'technology');

-- Add new columns with ENUM typesa
ALTER TABLE modules 
ADD COLUMN module_type_new module_type_enum DEFAULT 'standard',
ADD COLUMN category_new module_category_enum DEFAULT 'strategy';

-- Migrate existing data
UPDATE modules SET 
  module_type_new = CASE 
    WHEN module_type = 'standard' THEN 'standard'::module_type_enum
    WHEN module_type = 'specialized' THEN 'custom'::module_type_enum
    ELSE 'standard'::module_type_enum
  END,
  category_new = CASE 
    WHEN category = 'foundation' THEN 'foundation'::module_category_enum
    WHEN category = 'brand' THEN 'brand'::module_category_enum
    WHEN category = 'customer' THEN 'strategy'::module_category_enum
    WHEN category = 'messaging' THEN 'marketing'::module_category_enum
    WHEN category = 'website' THEN 'technology'::module_category_enum
    WHEN category = 'execution' THEN 'operations'::module_category_enum
    WHEN category = 'strategy' THEN 'strategy'::module_category_enum
    WHEN category = 'marketing' THEN 'marketing'::module_category_enum
    WHEN category = 'operations' THEN 'operations'::module_category_enum
    WHEN category = 'finance' THEN 'finance'::module_category_enum
    WHEN category = 'technology' THEN 'technology'::module_category_enum
    ELSE 'strategy'::module_category_enum
  END;

-- Drop old columns and rename new ones
ALTER TABLE modules 
DROP COLUMN module_type,
DROP COLUMN category;

ALTER TABLE modules 
RENAME COLUMN module_type_new TO module_type;
ALTER TABLE modules 
RENAME COLUMN category_new TO category;

-- Add NOT NULL constraints
ALTER TABLE modules 
ALTER COLUMN module_type SET NOT NULL,
ALTER COLUMN category SET NOT NULL;
-- Final cleanup: Remove remaining unnecessary columns from businesses table
-- This migration is safe and idempotent

DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  -- Drop strategic_onboarding_started_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='strategic_onboarding_started_at'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN strategic_onboarding_started_at;
    RAISE NOTICE 'Dropped strategic_onboarding_started_at';
  END IF;

  -- Drop strategic_onboarding_completed_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='strategic_onboarding_completed_at'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN strategic_onboarding_completed_at;
    RAISE NOTICE 'Dropped strategic_onboarding_completed_at';
  END IF;

  -- Drop questions_completed_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='questions_completed_at'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN questions_completed_at;
    RAISE NOTICE 'Dropped questions_completed_at';
  END IF;

  -- Drop segments_completed_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='segments_completed_at'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN segments_completed_at;
    RAISE NOTICE 'Dropped segments_completed_at';
  END IF;

  -- Drop personas_completed_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='personas_completed_at'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN personas_completed_at;
    RAISE NOTICE 'Dropped personas_completed_at';
  END IF;

  -- Drop type_enum
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='type_enum'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN type_enum;
    RAISE NOTICE 'Dropped type_enum';
  END IF;

  -- Drop years_in_business (no frontend for this)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='years_in_business'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN years_in_business;
    RAISE NOTICE 'Dropped years_in_business';
  END IF;

  -- Drop employee_count (no frontend for this)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='employee_count'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN employee_count;
    RAISE NOTICE 'Dropped employee_count';
  END IF;

  -- Drop annual_revenue (no frontend for this)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='annual_revenue'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN annual_revenue;
    RAISE NOTICE 'Dropped annual_revenue';
  END IF;

  -- Drop basics_completed_at (old onboarding system)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='basics_completed_at'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN basics_completed_at;
    RAISE NOTICE 'Dropped basics_completed_at';
  END IF;

  -- Drop onboarding_phase (replaced by onboarding_step)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='onboarding_phase'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN onboarding_phase;
    RAISE NOTICE 'Dropped onboarding_phase';
  END IF;

  -- Drop status_enum (not used)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='status_enum'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN status_enum;
    RAISE NOTICE 'Dropped status_enum';
  END IF;

  -- Drop onboarding_started_at (we have onboarding_path_selected_at)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='businesses' AND column_name='onboarding_started_at'
  ) INTO col_exists;
  IF col_exists THEN
    ALTER TABLE businesses DROP COLUMN onboarding_started_at;
    RAISE NOTICE 'Dropped onboarding_started_at';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Final cleanup complete!';
  RAISE NOTICE '   Removed 13 unnecessary columns from businesses table';
  RAISE NOTICE '';
END $$;

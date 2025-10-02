-- Run this in Supabase SQL Editor to see all businesses table columns

SELECT
  column_name,
  data_type,
  is_nullable
FROM
  information_schema.columns
WHERE
  table_name = 'businesses'
  AND table_schema = 'public'
ORDER BY
  ordinal_position;

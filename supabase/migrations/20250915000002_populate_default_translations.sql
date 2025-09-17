-- Populate translation tables with existing data as English defaults

-- Populate question translations with existing data
INSERT INTO question_translations (question_id, locale, title, definition, why_it_matters)
SELECT
    id,
    'en',
    COALESCE(title, ''),
    definition,
    why_it_matters
FROM questions
WHERE id IS NOT NULL
ON CONFLICT (question_id, locale) DO NOTHING;

-- Populate module translations with existing data
INSERT INTO module_translations (module_id, locale, name, description)
SELECT
    id,
    'en',
    COALESCE(name, ''),
    description
FROM modules
WHERE id IS NOT NULL
ON CONFLICT (module_id, locale) DO NOTHING;

-- Populate strategy translations with existing data
INSERT INTO strategy_translations (strategy_id, locale, name, description, target_audience)
SELECT
    id,
    'en',
    COALESCE(name, ''),
    description,
    target_audience
FROM strategies
WHERE id IS NOT NULL
ON CONFLICT (strategy_id, locale) DO NOTHING;

-- Populate business translations with existing data
INSERT INTO business_translations (business_id, locale, name, description)
SELECT
    id,
    'en',
    COALESCE(name, ''),
    description
FROM businesses
WHERE id IS NOT NULL
ON CONFLICT (business_id, locale) DO NOTHING;

-- Populate organization translations with existing data
INSERT INTO organization_translations (organization_id, locale, name, description)
SELECT
    id,
    'en',
    COALESCE(name, ''),
    description
FROM organizations
WHERE id IS NOT NULL
ON CONFLICT (organization_id, locale) DO NOTHING;

-- Populate project translations with existing data
INSERT INTO project_translations (project_id, locale, name, description)
SELECT
    id,
    'en',
    COALESCE(name, ''),
    description
FROM projects
WHERE id IS NOT NULL
ON CONFLICT (project_id, locale) DO NOTHING;

-- Add some sample German translations for existing content
-- (These can be updated with proper translations later)

-- Sample German translations for questions
INSERT INTO question_translations (question_id, locale, title, definition, why_it_matters)
SELECT
    id,
    'de',
    CASE
        WHEN title LIKE '%pain point%' THEN 'Was ist der Schmerzpunkt der Zielgruppe?'
        WHEN title LIKE '%Brand color%' THEN 'Markenfarbe?'
        ELSE title || ' (DE)'
    END,
    CASE
        WHEN definition IS NOT NULL THEN definition || ' (Deutsche Version)'
        ELSE NULL
    END,
    CASE
        WHEN why_it_matters IS NOT NULL THEN why_it_matters || ' (Deutsche Version)'
        ELSE NULL
    END
FROM questions
WHERE id IS NOT NULL
ON CONFLICT (question_id, locale) DO NOTHING;
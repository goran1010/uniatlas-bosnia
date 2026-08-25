-- Translate studyCycle enum values to Serbian (data-preserving renames)
ALTER TYPE "studyCycle" RENAME VALUE 'FIRST' TO 'PRVI';
ALTER TYPE "studyCycle" RENAME VALUE 'SECOND' TO 'DRUGI';
ALTER TYPE "studyCycle" RENAME VALUE 'THIRD' TO 'TRECI';
ALTER TYPE "studyCycle" RENAME VALUE 'INTEGRATED' TO 'INTEGRISANI';

-- Translate subjectType enum values to Serbian (data-preserving renames)
ALTER TYPE "subjectType" RENAME VALUE 'MANDATORY' TO 'OBAVEZNI';
ALTER TYPE "subjectType" RENAME VALUE 'ELECTIVE' TO 'IZBORNI';

-- Remap enum values stored inside pending_changes proposed-data JSON blobs
UPDATE "pending_changes"
SET "data" = jsonb_set(
  "data",
  '{cycle}',
  CASE "data"->>'cycle'
    WHEN 'FIRST' THEN '"PRVI"'::jsonb
    WHEN 'SECOND' THEN '"DRUGI"'::jsonb
    WHEN 'THIRD' THEN '"TRECI"'::jsonb
    WHEN 'INTEGRATED' THEN '"INTEGRISANI"'::jsonb
  END
)
WHERE "data" ? 'cycle'
  AND "data"->>'cycle' IN ('FIRST', 'SECOND', 'THIRD', 'INTEGRATED');

UPDATE "pending_changes"
SET "data" = jsonb_set(
  "data",
  '{type}',
  CASE "data"->>'type'
    WHEN 'MANDATORY' THEN '"OBAVEZNI"'::jsonb
    WHEN 'ELECTIVE' THEN '"IZBORNI"'::jsonb
  END
)
WHERE "data" ? 'type'
  AND "data"->>'type' IN ('MANDATORY', 'ELECTIVE');

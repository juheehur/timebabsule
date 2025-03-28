-- Add font_family column to time_capsules table
ALTER TABLE time_capsules
ADD COLUMN font_family TEXT DEFAULT 'omyu_pretty';

-- Update existing records to use default font
UPDATE time_capsules
SET font_family = 'omyu_pretty'
WHERE font_family IS NULL; 
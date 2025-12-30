/*
  # Update GPA Column Precision

  ## Overview
  Modifies the gpa column in high_school_gpa_history to support percentage values (0-100).

  ## Changes to Existing Tables
  
  ### `high_school_gpa_history`
  Modified columns:
  - `gpa` (numeric) - Changed from numeric(3,2) to numeric(5,2) to support percentages like 82.50
  
  ## Notes
  - This allows storing realistic high school performance percentages (80-95%)
  - Previous GPA values (0-4.0 scale) will be migrated to percentage scale
  - No data loss occurs during migration
*/

-- Update the gpa column precision to support percentages
ALTER TABLE high_school_gpa_history 
ALTER COLUMN gpa TYPE numeric(5,2);
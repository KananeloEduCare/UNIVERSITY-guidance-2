/*
  # Add Sample Counselor Availability Data

  1. Purpose
    - Add sample availability slots for counselors to test the meeting booking system
    - Create various time slots across different dates and times
  
  2. Changes
    - Insert sample availability slots for the next 2 weeks
    - Ensure slots are distributed across different times of day
*/

-- Add availability for counselor 1 (Sarah Anderson)
INSERT INTO counselor_availability (counselor_id, date, start_time, end_time, is_booked)
SELECT 
  c.id,
  (CURRENT_DATE + (d || ' days')::INTERVAL)::DATE,
  t.start_time::TIME,
  t.end_time::TIME,
  false
FROM 
  counselors c,
  generate_series(1, 14) d,
  (VALUES 
    ('09:00:00', '10:00:00'),
    ('10:30:00', '11:30:00'),
    ('14:00:00', '15:00:00'),
    ('15:30:00', '16:30:00')
  ) AS t(start_time, end_time)
WHERE 
  c.email = 'sarah.anderson@demo.com'
  AND EXTRACT(DOW FROM (CURRENT_DATE + (d || ' days')::INTERVAL)) NOT IN (0, 6)
ON CONFLICT DO NOTHING;

-- Add availability for counselor 2 (Michael Chen)
INSERT INTO counselor_availability (counselor_id, date, start_time, end_time, is_booked)
SELECT 
  c.id,
  (CURRENT_DATE + (d || ' days')::INTERVAL)::DATE,
  t.start_time::TIME,
  t.end_time::TIME,
  false
FROM 
  counselors c,
  generate_series(1, 14) d,
  (VALUES 
    ('11:00:00', '12:00:00'),
    ('13:00:00', '14:00:00'),
    ('16:00:00', '17:00:00')
  ) AS t(start_time, end_time)
WHERE 
  c.email = 'michael.chen@demo.com'
  AND EXTRACT(DOW FROM (CURRENT_DATE + (d || ' days')::INTERVAL)) NOT IN (0, 6)
ON CONFLICT DO NOTHING;


-- تحديث هدف معدل الرد على المكالمات ليصبح 80%
UPDATE metrics 
SET 
  target = '80%',
  change = CASE 
    WHEN period = 'weekly' THEN -77.5
    WHEN period = 'yearly' THEN -80.0
    ELSE change
  END,
  is_positive = false,
  reached_target = false,
  is_lower_better = false
WHERE title = 'معدل الرد على المكالمات';

-- التأكد من أن البيانات محدثة بشكل صحيح
UPDATE metrics 
SET updated_at = NOW()
WHERE title = 'معدل الرد على المكالمات';

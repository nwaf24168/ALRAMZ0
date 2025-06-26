
-- إضافة عمود expected_closure_time إلى جدول complaints
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS expected_closure_time TEXT;

-- تحديث البيانات الموجودة لتعيين قيمة افتراضية
UPDATE complaints 
SET expected_closure_time = '' 
WHERE expected_closure_time IS NULL;

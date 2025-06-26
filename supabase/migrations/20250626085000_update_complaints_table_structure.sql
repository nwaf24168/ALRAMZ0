
-- تحديث جدول الشكاوى لإضافة الأعمدة الجديدة
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'متوسطة',
ADD COLUMN IF NOT EXISTS request_number TEXT,
ADD COLUMN IF NOT EXISTS maintenance_delivery_action TEXT,
ADD COLUMN IF NOT EXISTS expected_closure_time TEXT;

-- تحديث الأعمدة الموجودة لتتناسب مع المتطلبات الجديدة
ALTER TABLE complaints 
ALTER COLUMN complaint_id SET DEFAULT 'REQ-' || LPAD(nextval('complaints_id_seq')::text, 6, '0');

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_request_number ON complaints(request_number);

-- تحديث البيانات الموجودة لتعيين قيم افتراضية
UPDATE complaints 
SET 
  priority = 'متوسطة' WHERE priority IS NULL,
  request_number = 'REQ-' || LPAD(id::text, 6, '0') WHERE request_number IS NULL,
  maintenance_delivery_action = '' WHERE maintenance_delivery_action IS NULL,
  expected_closure_time = '' WHERE expected_closure_time IS NULL;


# إعداد قاعدة بيانات Supabase

## الخطوات المطلوبة:

### 1. تسجيل الدخول إلى Supabase
- اذهب إلى: https://gfzeqvxsmeeehvqixidp.supabase.co
- قم بتسجيل الدخول إلى لوحة التحكم

### 2. تنفيذ SQL Scripts
- اذهب إلى SQL Editor في لوحة التحكم
- انسخ والصق محتوى ملف `supabase-schema.sql`
- قم بتنفيذ السكريبت لإنشاء الجداول

### 3. إعداد Row Level Security (اختياري)
إذا كنت تريد إضافة أمان إضافي، يمكنك تنفيذ هذه السكريبتات:

```sql
-- تفعيل Row Level Security
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE satisfaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات للوصول الكامل (يمكن تخصيصها حسب الحاجة)
CREATE POLICY "Enable all operations for all users" ON metrics FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON customer_service FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON satisfaction FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON comments FOR ALL USING (true);
```

### 4. إدراج بيانات تجريبية (اختياري)
```sql
-- إدراج مؤشرات تجريبية للفترة الأسبوعية
INSERT INTO metrics (period, metric_index, title, value, target, change, is_positive, reached_target, is_lower_better) VALUES
('weekly', 0, 'معدل الرضا العام', '85%', '85%', 0, true, true, false),
('weekly', 1, 'معدل حل المشاكل من أول مرة', '78%', '80%', -2.5, false, false, false),
('weekly', 2, 'متوسط وقت الاستجابة', '2.5', '3.0', 16.7, true, true, true),
('weekly', 3, 'معدل تجديد العقود', '92%', '90%', 2.2, true, true, false),
('weekly', 4, 'عدد الشكاوى الجديدة', '15', '20', 25, true, true, true);

-- إدراج بيانات خدمة العملاء للفترة الأسبوعية
INSERT INTO customer_service (period, complaints, contact_requests, maintenance_requests, inquiries, office_interested, projects_interested, customers_interested, total, general_inquiries, document_requests, deed_inquiries, apartment_rentals, sold_projects, cancelled_maintenance, resolved_maintenance, in_progress_maintenance) VALUES
('weekly', 28, 45, 65, 58, 34, 38, 42, 310, 20, 10, 8, 12, 8, 5, 45, 15);
```

### 5. التحقق من البيانات
بعد تنفيذ السكريبتات، تأكد من وجود الجداول بتنفيذ:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

يجب أن ترى الجداول التالية:
- metrics
- customer_service  
- satisfaction
- comments

### 6. اختبار الاتصال
بعد تنفيذ السكريبتات، قم بتشغيل التطبيق واختبر إدخال البيانات للتأكد من عمل الاتصال بقاعدة البيانات.

## ملاحظات مهمة:
- تأكد من أن مفتاح API المستخدم له الصلاحيات المناسبة
- يمكن مراقبة العمليات من خلال لوحة التحكم في Supabase
- جميع البيانات ستكون مفصولة حسب الفترة (weekly/yearly)

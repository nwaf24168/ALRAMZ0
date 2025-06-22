
-- إضافة عمود permissions لجدول المستخدمين
ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '{"level":"read","scope":"full","pages":[]}';

-- تحديث المستخدمين الحاليين بصلاحيات افتراضية
UPDATE users SET permissions = '{"level":"edit","scope":"full","pages":[]}' WHERE role = 'مدير النظام';
UPDATE users SET permissions = '{"level":"edit","scope":"full","pages":[]}' WHERE role = 'مدير ادارة راحة العملاء';
UPDATE users SET permissions = '{"level":"read","scope":"full","pages":[]}' WHERE role = 'موظف ادارة راحة العملاء';

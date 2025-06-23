
-- إصلاح جدول المستخدمين لجعل عمود id يتم إنشاؤه تلقائياً

-- التحقق من وجود الجدول وإعادة إنشاؤه إذا لزم الأمر
DROP TABLE IF EXISTS users CASCADE;

-- إنشاء جدول المستخدمين مع إعداد صحيح لعمود id
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  permissions JSONB DEFAULT '{"level":"read","scope":"full","pages":[]}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس على اسم المستخدم للبحث السريع
CREATE INDEX idx_users_username ON users(username);

-- إدراج المستخدمين الافتراضيين
INSERT INTO users (username, password, role, permissions) VALUES
('admin', 'admin123', 'مدير النظام', '{"level":"edit","scope":"full","pages":[]}'),
('abdulsalam', 'Alramz2025', 'مدير ادارة راحة العملاء', '{"level":"edit","scope":"full","pages":[]}'),
('aljawhara', 'Alramz2025', 'موظف ادارة راحة العملاء', '{"level":"edit","scope":"full","pages":[]}'),
('khulood', 'Alramz2025', 'موظف ادارة راحة العملاء', '{"level":"edit","scope":"full","pages":[]}'),
('adnan', 'Alramz2025', 'موظف ادارة راحة العملاء', '{"level":"edit","scope":"full","pages":[]}'),
('lateefa', 'Alramz2025', 'موظف ادارة راحة العملاء', '{"level":"edit","scope":"full","pages":[]}'),
('nawaf', 'Alramz2025', 'موظف ادارة راحة العملاء', '{"level":"read","scope":"limited","pages":["delivery"]}'::jsonb);

-- تمكين RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للوصول للبيانات
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON users FOR DELETE USING (true);

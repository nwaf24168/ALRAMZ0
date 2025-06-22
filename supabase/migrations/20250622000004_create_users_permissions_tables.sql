
-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الصلاحيات
CREATE TABLE IF NOT EXISTS user_permissions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('read', 'edit')),
  permission_scope TEXT NOT NULL CHECK (permission_scope IN ('full', 'limited')),
  allowed_pages TEXT[], -- مصفوفة للصفحات المسموحة
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء المؤشرات لتحسين الأداء
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);

-- تمكين Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- إنشاء السياسات للمستخدمين
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON users
  FOR DELETE USING (true);

-- إنشاء السياسات للصلاحيات
CREATE POLICY "Enable read access for all users" ON user_permissions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON user_permissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON user_permissions
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON user_permissions
  FOR DELETE USING (true);

-- إدراج المستخدمين الافتراضيين
INSERT INTO users (id, username, password, role) VALUES
  ('1', 'admin', 'admin123', 'مدير النظام'),
  ('2', 'abdulsalam', 'Alramz2025', 'مدير ادارة راحة العملاء'),
  ('3', 'aljawhara', 'Alramz2025', 'موظف ادارة راحة العملاء'),
  ('4', 'khulood', 'Alramz2025', 'موظف ادارة راحة العملاء'),
  ('5', 'adnan', 'Alramz2025', 'موظف ادارة راحة العملاء'),
  ('6', 'lateefa', 'Alramz2025', 'موظف ادارة راحة العملاء'),
  ('7', 'nawaf', 'Alramz2025', 'مدير النظام')
ON CONFLICT (id) DO NOTHING;

-- إدراج الصلاحيات الافتراضية
INSERT INTO user_permissions (user_id, permission_level, permission_scope, allowed_pages) VALUES
  ('1', 'edit', 'full', ARRAY[]::TEXT[]),
  ('2', 'edit', 'full', ARRAY[]::TEXT[]),
  ('3', 'edit', 'limited', ARRAY['dashboard', 'complaints', 'reception']),
  ('4', 'edit', 'limited', ARRAY['dashboard', 'complaints', 'quality-calls']),
  ('5', 'read', 'limited', ARRAY['dashboard', 'analytics', 'reports']),
  ('6', 'edit', 'limited', ARRAY['dashboard', 'delivery', 'delivery-analytics']),
  ('7', 'edit', 'full', ARRAY[]::TEXT[])
ON CONFLICT DO NOTHING;

-- تحديث تلقائي لحقل updated_at للمستخدمين
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- تحديث تلقائي لحقل updated_at للصلاحيات
CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_permissions_updated_at_trigger
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_permissions_updated_at();

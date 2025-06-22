
-- إصلاح جدول المستخدمين لضمان التوليد التلقائي للـ id

-- التأكد من أن الجدول يحتوي على تسلسل تلقائي للـ id
DO $$ 
BEGIN 
  -- التحقق من وجود sequence للجدول
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.sequences 
    WHERE sequence_name = 'users_id_seq'
  ) THEN
    -- إنشاء sequence جديد
    CREATE SEQUENCE users_id_seq;
    
    -- ربط الـ sequence بالجدول
    ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
    
    -- تحديد القيمة الحالية للـ sequence بناء على أعلى id موجود
    PERFORM setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
  END IF;
END $$;

-- التأكد من أن عمود id هو المفتاح الأساسي
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id) ON CONFLICT DO NOTHING;

-- إضافة فهرس فريد على اسم المستخدم إذا لم يكن موجوداً
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username);

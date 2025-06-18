-- إنشاء جدول الشكاوى
CREATE TABLE IF NOT EXISTS public.complaints (
  id BIGSERIAL PRIMARY KEY,
  complaint_id TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  project TEXT NOT NULL,
  unit_number TEXT,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'جديدة',
  description TEXT NOT NULL,
  action TEXT,
  duration INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول تحديثات الشكاوى
CREATE TABLE IF NOT EXISTS public.complaint_updates (
  id BIGSERIAL PRIMARY KEY,
  complaint_id TEXT NOT NULL REFERENCES public.complaints(complaint_id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الحجوزات
CREATE TABLE IF NOT EXISTS public.bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_id TEXT UNIQUE NOT NULL,
  booking_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  project TEXT NOT NULL,
  building TEXT,
  unit TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  sale_type TEXT NOT NULL,
  unit_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  transfer_date DATE,
  sales_employee TEXT NOT NULL,
  construction_end_date DATE,
  final_receipt_date DATE,
  electricity_transfer_date DATE,
  water_transfer_date DATE,
  delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'بانتظار إدارة المشاريع وراحة العملاء',
  status_sales_filled BOOLEAN DEFAULT TRUE,
  status_projects_filled BOOLEAN DEFAULT FALSE,
  status_customer_filled BOOLEAN DEFAULT FALSE,
  is_evaluated BOOLEAN DEFAULT FALSE,
  evaluation_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON public.complaints(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON public.bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- تمكين الوقت الفعلي للجداول
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- إنشاء دوال لتحديث الطوابع الزمنية
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء محفزات لتحديث الطوابع الزمنية تلقائياً
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إنشاء دالة لتسجيل تحديثات الشكاوى
CREATE OR REPLACE FUNCTION log_complaint_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- تسجيل التغييرات في جدول complaint_updates
        IF OLD.status != NEW.status THEN
            INSERT INTO public.complaint_updates (complaint_id, field_name, old_value, new_value, updated_by)
            VALUES (NEW.complaint_id, 'status', OLD.status, NEW.status, NEW.updated_by);
        END IF;
        
        IF OLD.description != NEW.description THEN
            INSERT INTO public.complaint_updates (complaint_id, field_name, old_value, new_value, updated_by)
            VALUES (NEW.complaint_id, 'description', OLD.description, NEW.description, NEW.updated_by);
        END IF;
        
        IF OLD.action != NEW.action OR (OLD.action IS NULL AND NEW.action IS NOT NULL) THEN
            INSERT INTO public.complaint_updates (complaint_id, field_name, old_value, new_value, updated_by)
            VALUES (NEW.complaint_id, 'action', OLD.action, NEW.action, NEW.updated_by);
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- إنشاء محفز لتسجيل تحديثات الشكاوى
CREATE TRIGGER log_complaint_changes_trigger
    AFTER UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION log_complaint_changes();

-- إدراج بيانات تجريبية للشكاوى
INSERT INTO public.complaints (complaint_id, date, customer_name, project, unit_number, source, status, description, action, created_by) VALUES
('C001', '2025-01-30', 'أحمد محمد', 'مشروع الواحة', 'A101', 'مكالمة هاتفية', 'جديدة', 'مشكلة في التكييف', 'تم التواصل مع فريق الصيانة', 'admin'),
('C002', '2025-01-29', 'فاطمة علي', 'مشروع النخيل', 'B205', 'البريد الإلكتروني', 'قيد المعالجة', 'تسرب في السباكة', 'تم إرسال فني السباكة', 'admin'),
('C003', '2025-01-28', 'محمد سالم', 'مشروع الزهور', 'C302', 'زيارة شخصية', 'تم حلها', 'مشكلة في الإضاءة', 'تم استبدال المصابيح', 'admin');

-- إدراج بيانات تجريبية للحجوزات
INSERT INTO public.bookings (booking_id, booking_date, customer_name, project, building, unit, payment_method, sale_type, unit_value, sales_employee) VALUES
('B001', '2025-01-30', 'سارة أحمد', 'مشروع الواحة', 'A', '101', 'تمويل عقاري', 'بيع على الخارطة', 500000.00, 'علي محمد'),
('B002', '2025-01-29', 'خالد سعد', 'مشروع النخيل', 'B', '205', 'نقدي', 'جاهز', 750000.00, 'نورا سالم'),
('B003', '2025-01-28', 'منى عبدالله', 'مشروع الزهور', 'C', '302', 'تحويل بنكي', 'بيع على الخارطة', 600000.00, 'أحمد علي');
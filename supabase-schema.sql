
-- إنشاء جدول المؤشرات
CREATE TABLE IF NOT EXISTS public.metrics (
    id BIGSERIAL PRIMARY KEY,
    period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
    metric_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    value TEXT NOT NULL,
    target TEXT NOT NULL,
    change DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_positive BOOLEAN NOT NULL DEFAULT false,
    reached_target BOOLEAN NOT NULL DEFAULT false,
    is_lower_better BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period, metric_index)
);

-- إنشاء جدول خدمة العملاء
CREATE TABLE IF NOT EXISTS public.customer_service (
    id BIGSERIAL PRIMARY KEY,
    period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
    complaints INTEGER NOT NULL DEFAULT 0,
    contact_requests INTEGER NOT NULL DEFAULT 0,
    maintenance_requests INTEGER NOT NULL DEFAULT 0,
    inquiries INTEGER NOT NULL DEFAULT 0,
    office_interested INTEGER NOT NULL DEFAULT 0,
    projects_interested INTEGER NOT NULL DEFAULT 0,
    customers_interested INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    general_inquiries INTEGER NOT NULL DEFAULT 0,
    document_requests INTEGER NOT NULL DEFAULT 0,
    deed_inquiries INTEGER NOT NULL DEFAULT 0,
    apartment_rentals INTEGER NOT NULL DEFAULT 0,
    sold_projects INTEGER NOT NULL DEFAULT 0,
    cancelled_maintenance INTEGER NOT NULL DEFAULT 0,
    resolved_maintenance INTEGER NOT NULL DEFAULT 0,
    in_progress_maintenance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period)
);

-- إنشاء جدول رضا العملاء
CREATE TABLE IF NOT EXISTS public.satisfaction (
    id BIGSERIAL PRIMARY KEY,
    period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('serviceQuality', 'closureTime', 'firstTimeResolution')),
    very_happy INTEGER NOT NULL DEFAULT 0,
    happy INTEGER NOT NULL DEFAULT 0,
    neutral INTEGER NOT NULL DEFAULT 0,
    unhappy INTEGER NOT NULL DEFAULT 0,
    very_unhappy INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period, category)
);

-- إنشاء جدول التعليقات
CREATE TABLE IF NOT EXISTS public.comments (
    id BIGSERIAL PRIMARY KEY,
    period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
    text TEXT NOT NULL,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_metrics_period ON public.metrics(period);
CREATE INDEX IF NOT EXISTS idx_customer_service_period ON public.customer_service(period);
CREATE INDEX IF NOT EXISTS idx_satisfaction_period_category ON public.satisfaction(period, category);
CREATE INDEX IF NOT EXISTS idx_comments_period ON public.comments(period);

-- إدراج بيانات تجريبية للمؤشرات الأسبوعية
INSERT INTO public.metrics (period, metric_index, title, value, target, change, is_positive, reached_target, is_lower_better) VALUES
('weekly', 0, 'معدل رضا العملاء', '85%', '90%', -5.56, false, false, false),
('weekly', 1, 'وقت الاستجابة', '2.5ساعة', '2ساعة', 25.0, false, false, true),
('weekly', 2, 'نسبة الحل من أول مرة', '75%', '80%', -6.25, false, false, false),
('weekly', 3, 'عدد الشكاوى المحلولة', '45', '50', -10.0, false, false, false),
('weekly', 4, 'معدل الجودة', '88%', '85%', 3.53, true, true, false),
('weekly', 5, 'نسبة التجديد', '92%', '90%', 2.22, true, true, false),
('weekly', 6, 'رضا فريق العمل', '78%', '80%', -2.5, false, false, false),
('weekly', 7, 'معدل الحضور', '95%', '98%', -3.06, false, false, false),
('weekly', 8, 'عدد التدريبات', '12', '15', -20.0, false, false, false),
('weekly', 9, 'معدل الإنتاجية', '82%', '85%', -3.53, false, false, false),
('weekly', 10, 'وقت التسليم', '3.2يوم', '3يوم', 6.67, false, false, true),
('weekly', 11, 'نسبة الأخطاء', '2.1%', '2%', 5.0, false, false, true),
('weekly', 12, 'معدل الابتكار', '15', '20', -25.0, false, false, false),
('weekly', 13, 'رضا الشركاء', '87%', '85%', 2.35, true, true, false),
('weekly', 14, 'معدل النمو', '5.2%', '6%', -13.33, false, false, false)
ON CONFLICT (period, metric_index) DO NOTHING;

-- إدراج بيانات تجريبية للمؤشرات السنوية
INSERT INTO public.metrics (period, metric_index, title, value, target, change, is_positive, reached_target, is_lower_better) VALUES
('yearly', 0, 'معدل رضا العملاء', '88%', '90%', -2.22, false, false, false),
('yearly', 1, 'وقت الاستجابة', '2.2ساعة', '2ساعة', 10.0, false, false, true),
('yearly', 2, 'نسبة الحل من أول مرة', '78%', '80%', -2.5, false, false, false),
('yearly', 3, 'عدد الشكاوى المحلولة', '2340', '2500', -6.4, false, false, false),
('yearly', 4, 'معدل الجودة', '89%', '85%', 4.71, true, true, false),
('yearly', 5, 'نسبة التجديد', '94%', '90%', 4.44, true, true, false),
('yearly', 6, 'رضا فريق العمل', '81%', '80%', 1.25, true, true, false),
('yearly', 7, 'معدل الحضور', '96%', '98%', -2.04, false, false, false),
('yearly', 8, 'عدد التدريبات', '580', '600', -3.33, false, false, false),
('yearly', 9, 'معدل الإنتاجية', '85%', '85%', 0.0, true, true, false),
('yearly', 10, 'وقت التسليم', '3.1يوم', '3يوم', 3.33, false, false, true),
('yearly', 11, 'نسبة الأخطاء', '1.8%', '2%', -10.0, true, true, true),
('yearly', 12, 'معدل الابتكار', '780', '800', -2.5, false, false, false),
('yearly', 13, 'رضا الشركاء', '89%', '85%', 4.71, true, true, false),
('yearly', 14, 'معدل النمو', '6.1%', '6%', 1.67, true, true, false)
ON CONFLICT (period, metric_index) DO NOTHING;

-- إدراج بيانات تجريبية لخدمة العملاء
INSERT INTO public.customer_service (period, complaints, contact_requests, maintenance_requests, inquiries, office_interested, projects_interested, customers_interested, total, general_inquiries, document_requests, deed_inquiries, apartment_rentals, sold_projects, cancelled_maintenance, resolved_maintenance, in_progress_maintenance) VALUES
('weekly', 58, 34, 38, 42, 310, 20, 10, 512, 8, 12, 8, 5, 45, 15, 30, 8),
('yearly', 2890, 1720, 1950, 2180, 15600, 1040, 520, 26900, 420, 630, 420, 260, 2340, 780, 1560, 420)
ON CONFLICT (period) DO UPDATE SET
complaints = EXCLUDED.complaints,
contact_requests = EXCLUDED.contact_requests,
maintenance_requests = EXCLUDED.maintenance_requests,
inquiries = EXCLUDED.inquiries,
office_interested = EXCLUDED.office_interested,
projects_interested = EXCLUDED.projects_interested,
customers_interested = EXCLUDED.customers_interested,
total = EXCLUDED.total,
general_inquiries = EXCLUDED.general_inquiries,
document_requests = EXCLUDED.document_requests,
deed_inquiries = EXCLUDED.deed_inquiries,
apartment_rentals = EXCLUDED.apartment_rentals,
sold_projects = EXCLUDED.sold_projects,
cancelled_maintenance = EXCLUDED.cancelled_maintenance,
resolved_maintenance = EXCLUDED.resolved_maintenance,
in_progress_maintenance = EXCLUDED.in_progress_maintenance;

-- إدراج بيانات تجريبية لرضا العملاء
INSERT INTO public.satisfaction (period, category, very_happy, happy, neutral, unhappy, very_unhappy) VALUES
('weekly', 'serviceQuality', 30, 40, 20, 8, 2),
('weekly', 'closureTime', 25, 45, 20, 7, 3),
('weekly', 'firstTimeResolution', 35, 38, 18, 6, 3),
('yearly', 'serviceQuality', 32, 42, 18, 6, 2),
('yearly', 'closureTime', 28, 47, 18, 5, 2),
('yearly', 'firstTimeResolution', 38, 40, 16, 4, 2)
ON CONFLICT (period, category) DO UPDATE SET
very_happy = EXCLUDED.very_happy,
happy = EXCLUDED.happy,
neutral = EXCLUDED.neutral,
unhappy = EXCLUDED.unhappy,
very_unhappy = EXCLUDED.very_unhappy;

-- إنشاء جدول الشكاوى
CREATE TABLE IF NOT EXISTS public.complaints (
    id BIGSERIAL PRIMARY KEY,
    complaint_id VARCHAR(20) NOT NULL UNIQUE,
    date DATE NOT NULL,
    customer_name TEXT NOT NULL,
    project TEXT NOT NULL,
    unit_number TEXT,
    source TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    action TEXT,
    duration INTEGER NOT NULL DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    updates JSONB DEFAULT '[]'::jsonb
);

-- إنشاء فهرس للبحث
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON public.complaints(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaints_customer_name ON public.complaints(customer_name);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_date ON public.complaints(date);

-- إدراج بيانات تجريبية للشكاوى
INSERT INTO public.complaints (complaint_id, date, customer_name, project, unit_number, source, status, description, action, duration, created_by) VALUES
('1001', '2025-01-01', 'أحمد الصبياني', 'تل الرمال المالية', '', 'الاستبيان', 'تم حلها', 'الشيك محرر للصندوق ولم نتلقى مبلغ الضريبة , تم التواصل مع الصندوق و رد الضريبة للعميل من قبلنا.', '', 0, 'عدنان'),
('1002', '2025-02-27', 'راشد المحنا', '19', '', 'المقر', 'تم حلها', 'رفع شكوى في 2022 عن تسريب في المكيف تم حلها على حسابه الخاص، أعاد التواصل في 2024 حول عودة المشكلة.', 'تم الانتهاء من العزل وتم اختباره وبانتظار تركيب البلاط بالشقة العلوية ، وفيما يتعلق بشكوى العميل متبقي دهان الاسقف في الشقة وبناء على طلب العميل بأن يكون الموعد للدهان بعد العيد', 365, 'عدنان'),
('1003', '2025-01-26', 'نورة المسفر', 'المعالي', '', 'خدمة العملاء', 'تم حلها', 'تم إصلاح مشكلة الألمنيوم بسد الفجوات بالسيلكون والربل.', '', 0, 'عدنان'),
('1004', '2025-01-28', 'حمد الحسين', 'النخيل', 'فيلا 10', 'خدمة العملاء', 'لازالت قائمة', 'تم الضغط عليه من مهندس الجودة لقبول التسليم، بعد التسليم ظهر له بعض المشاكل،البوية،التشققات في الجدران، إطارات الأبواب.', 'آخر تحديث 25 مارس، باقي له فقط الخشب.', 60, 'عدنان'),
('1005', '2025-02-17', 'تركي السعيد', 'المعالي', 'و 26 / ع 26', 'الاستبيان', 'تم حلها', 'التـاخر في التسليم بسبب عدم حل الإصلاحات لدى العميل متبقى مشكلة ميلان البلاط.', 'تم التحديث من قبل المهندس سعود موصلي بأنتهاء جميع الاصلاحات، تم التواصل مع العميل وافاد بانه لم يتم اصلاح الميلان للان، تم التواصل مع سعود 25 مارس، وذكر بأن العميل تم اصلاح جميع مشاكله وتم الاتفاق ان التسليم 12 بالليل ولم يلتزم العميل، تم تحديد موعد جديد 25 مارس مساءً، تم التسليم في 26 مارس.', 37, 'عدنان')
ON CONFLICT (complaint_id) DO NOTHING;

-- إضافة تعليقات تجريبية
INSERT INTO public.comments (period, text, username) VALUES
('weekly', 'تم تحسين وقت الاستجابة بشكل ملحوظ هذا الأسبوع', 'nawaf'),
('weekly', 'نحتاج إلى المزيد من التدريب لفريق خدمة العملاء', 'abdulsalam'),
('yearly', 'الأداء العام جيد ولكن هناك مجال للتحسين في بعض المؤشرات', 'admin'),
('yearly', 'معدل رضا العملاء يحتاج إلى تركيز أكبر العام القادم', 'aljawhara');

-- تحديث الوقت
UPDATE public.metrics SET updated_at = NOW();
UPDATE public.customer_service SET updated_at = NOW();

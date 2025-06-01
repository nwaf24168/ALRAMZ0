
-- حذف الجداول إذا كانت موجودة (لضمان إعادة الإنشاء الصحيح)
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.satisfaction CASCADE;
DROP TABLE IF EXISTS public.customer_service CASCADE;
DROP TABLE IF EXISTS public.metrics CASCADE;
DROP TABLE IF EXISTS public.complaints CASCADE;

-- إنشاء جدول المؤشرات
CREATE TABLE public.metrics (
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
CREATE TABLE public.customer_service (
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
CREATE TABLE public.satisfaction (
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
CREATE TABLE public.comments (
    id BIGSERIAL PRIMARY KEY,
    period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
    text TEXT NOT NULL,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الشكاوى
CREATE TABLE public.complaints (
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

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX idx_metrics_period ON public.metrics(period);
CREATE INDEX idx_customer_service_period ON public.customer_service(period);
CREATE INDEX idx_satisfaction_period_category ON public.satisfaction(period, category);
CREATE INDEX idx_comments_period ON public.comments(period);
CREATE INDEX idx_complaints_complaint_id ON public.complaints(complaint_id);
CREATE INDEX idx_complaints_customer_name ON public.complaints(customer_name);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_date ON public.complaints(date);

-- إدراج بيانات تجريبية للمؤشرات مع الأسماء الصحيحة
INSERT INTO public.metrics (period, metric_index, title, value, target, change, is_positive, reached_target, is_lower_better) VALUES
-- المؤشرات الأسبوعية
('weekly', 0, 'نسبة الترشيح للعملاء الجدد', '60%', '65%', -7.69, false, false, false),
('weekly', 1, 'نسبة الترشيح بعد السنة', '62%', '65%', -4.62, false, false, false),
('weekly', 2, 'نسبة الترشيح للعملاء القدامى', '28%', '30%', -6.67, false, false, false),
('weekly', 3, 'جودة التسليم', '98%', '100%', -2.0, false, false, false),
('weekly', 4, 'جودة الصيانة', '95%', '100%', -5.0, false, false, false),
('weekly', 5, 'عدد الثواني للرد', '3.5', '< 3', 16.67, false, false, true),
('weekly', 6, 'معدل الرد على المكالمات', '75%', '80%', -6.25, false, false, false),
('weekly', 7, 'راحة العميل (CSAT)', '68%', '70%', -2.86, false, false, false),
('weekly', 8, 'سرعة إغلاق طلبات الصيانة', '3.5', '< 3', 16.67, false, false, true),
('weekly', 9, 'عدد إعادة فتح الطلب', '0.2', '< 0', 20.0, false, false, true),
('weekly', 10, 'جودة إدارة المرافق', '78%', '80%', -2.5, false, false, false),
('weekly', 11, 'معدل التحول', '2.2%', '2%', 10.0, false, false, true),
('weekly', 12, 'نسبة الرضا عن التسليم', '78%', '80%', -2.5, false, false, false),
('weekly', 13, 'عدد العملاء المرشحين', '580', '584', -0.68, false, false, false),
('weekly', 14, 'المساهمة في المبيعات', '4.8%', '5%', -4.0, false, false, false),

-- المؤشرات السنوية
('yearly', 0, 'نسبة الترشيح للعملاء الجدد', '63%', '65%', -3.08, false, false, false),
('yearly', 1, 'نسبة الترشيح بعد السنة', '64%', '65%', -1.54, false, false, false),
('yearly', 2, 'نسبة الترشيح للعملاء القدامى', '29%', '30%', -3.33, false, false, false),
('yearly', 3, 'جودة التسليم', '99%', '100%', -1.0, false, false, false),
('yearly', 4, 'جودة الصيانة', '98%', '100%', -2.0, false, false, false),
('yearly', 5, 'عدد الثواني للرد', '2.8', '< 3', -6.67, true, true, true),
('yearly', 6, 'معدل الرد على المكالمات', '82%', '80%', 2.5, true, true, false),
('yearly', 7, 'راحة العميل (CSAT)', '72%', '70%', 2.86, true, true, false),
('yearly', 8, 'سرعة إغلاق طلبات الصيانة', '2.8', '< 3', -6.67, true, true, true),
('yearly', 9, 'عدد إعادة فتح الطلب', '-0.1', '< 0', -10.0, true, true, true),
('yearly', 10, 'جودة إدارة المرافق', '82%', '80%', 2.5, true, true, false),
('yearly', 11, 'معدل التحول', '1.8%', '2%', -10.0, true, true, true),
('yearly', 12, 'نسبة الرضا عن التسليم', '82%', '80%', 2.5, true, true, false),
('yearly', 13, 'عدد العملاء المرشحين', '7000', '7004', -0.06, false, false, false),
('yearly', 14, 'المساهمة في المبيعات', '5.2%', '5%', 4.0, true, true, false);

-- إدراج بيانات تجريبية لخدمة العملاء
INSERT INTO public.customer_service (period, complaints, contact_requests, maintenance_requests, inquiries, office_interested, projects_interested, customers_interested, total, general_inquiries, document_requests, deed_inquiries, apartment_rentals, sold_projects, cancelled_maintenance, resolved_maintenance, in_progress_maintenance) VALUES
('weekly', 58, 34, 38, 42, 310, 20, 10, 512, 8, 12, 8, 5, 45, 15, 30, 8),
('yearly', 2890, 1720, 1950, 2180, 15600, 1040, 520, 26900, 420, 630, 420, 260, 2340, 780, 1560, 420);

-- إدراج بيانات تجريبية لرضا العملاء
INSERT INTO public.satisfaction (period, category, very_happy, happy, neutral, unhappy, very_unhappy) VALUES
('weekly', 'serviceQuality', 30, 40, 20, 8, 2),
('weekly', 'closureTime', 25, 45, 20, 7, 3),
('weekly', 'firstTimeResolution', 35, 38, 18, 6, 3),
('yearly', 'serviceQuality', 32, 42, 18, 6, 2),
('yearly', 'closureTime', 28, 47, 18, 5, 2),
('yearly', 'firstTimeResolution', 38, 40, 16, 4, 2);

-- إدراج بيانات تجريبية للشكاوى
INSERT INTO public.complaints (complaint_id, date, customer_name, project, unit_number, source, status, description, action, duration, created_by) VALUES
('1001', '2025-01-01', 'أحمد الصبياني', 'تل الرمال المالية', '', 'الاستبيان', 'تم حلها', 'الشيك محرر للصندوق ولم نتلقى مبلغ الضريبة , تم التواصل مع الصندوق و رد الضريبة للعميل من قبلنا.', '', 0, 'عدنان'),
('1002', '2025-02-27', 'راشد المحنا', '19', '', 'المقر', 'تم حلها', 'رفع شكوى في 2022 عن تسريب في المكيف تم حلها على حسابه الخاص، أعاد التواصل في 2024 حول عودة المشكلة.', 'تم الانتهاء من العزل وتم اختباره وبانتظار تركيب البلاط بالشقة العلوية ، وفيما يتعلق بشكوى العميل متبقي دهان الاسقف في الشقة وبناء على طلب العميل بأن يكون الموعد للدهان بعد العيد', 365, 'عدنان'),
('1003', '2025-01-26', 'نورة المسفر', 'المعالي', '', 'خدمة العملاء', 'تم حلها', 'تم إصلاح مشكلة الألمنيوم بسد الفجوات بالسيلكون والربل.', '', 0, 'عدنان'),
('1004', '2025-01-28', 'حمد الحسين', 'النخيل', 'فيلا 10', 'خدمة العملاء', 'لازالت قائمة', 'تم الضغط عليه من مهندس الجودة لقبول التسليم، بعد التسليم ظهر له بعض المشاكل،البوية،التشققات في الجدران، إطارات الأبواب.', 'آخر تحديث 25 مارس، باقي له فقط الخشب.', 60, 'عدنان'),
('1005', '2025-02-17', 'تركي السعيد', 'المعالي', 'و 26 / ع 26', 'الاستبيان', 'تم حلها', 'التـاخر في التسليم بسبب عدم حل الإصلاحات لدى العميل متبقى مشكلة ميلان البلاط.', 'تم التحديث من قبل المهندس سعود موصلي بأنتهاء جميع الاصلاحات، تم التواصل مع العميل وافاد بانه لم يتم اصلاح الميلان للان، تم التواصل مع سعود 25 مارس، وذكر بأن العميل تم اصلاح جميع مشاكله وتم الاتفاق ان التسليم 12 بالليل ولم يلتزم العميل، تم تحديد موعد جديد 25 مارس مساءً، تم التسليم في 26 مارس.', 37, 'عدنان');

-- إضافة تعليقات تجريبية
INSERT INTO public.comments (period, text, username) VALUES
('weekly', 'تم تحسين وقت الاستجابة بشكل ملحوظ هذا الأسبوع', 'nawaf'),
('weekly', 'نحتاج إلى المزيد من التدريب لفريق خدمة العملاء', 'abdulsalam'),
('yearly', 'الأداء العام جيد ولكن هناك مجال للتحسين في بعض المؤشرات', 'admin'),
('yearly', 'معدل رضا العملاء يحتاج إلى تركيز أكبر العام القادم', 'aljawhara');

-- تحديث الأوقات
UPDATE public.metrics SET updated_at = NOW();
UPDATE public.customer_service SET updated_at = NOW();

-- إعطاء صلاحيات الوصول (اختياري - حسب إعدادات الأمان)
-- ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.customer_service ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.satisfaction ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- إظهار رسالة نجاح
SELECT 'تم إنشاء جميع الجداول بنجاح!' as message;

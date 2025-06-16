-- تحديث البيانات في جدول المؤشرات لتتطابق مع الصور المرفقة

-- حذف البيانات الحالية وإعادة إدراجها بالقيم الصحيحة
DELETE FROM public.metrics;

-- إدراج المؤشرات الأسبوعية الصحيحة
INSERT INTO public.metrics (period, metric_index, title, value, target, change, is_positive, reached_target, is_lower_better) VALUES
('weekly', 0, 'نسبة الترشيح للعملاء الجدد', '65%', '65%', 2.4, true, true, false),
('weekly', 1, 'نسبة الترشيح بعد السنة', '67%', '65%', 3.1, true, true, false),
('weekly', 2, 'نسبة الترشيح للعملاء القدامى', '30%', '30%', 1.8, true, true, false),
('weekly', 3, 'جودة التسليم', '98%', '100%', 1.5, true, false, false),
('weekly', 4, 'جودة الصيانة', '96%', '100%', 2.8, true, false, false),
('weekly', 5, 'عدد الثواني للرد', '2.8 ثانية', '3 ثواني', 5.7, false, true, true),
('weekly', 6, 'معدل الرد على المكالمات', '18%', '80%', 4.3, false, false, false),
('weekly', 7, 'راحة العميل (CSAT)', '74%', '70%', 5.7, true, true, false),
('weekly', 8, 'سرعة إغلاق طلبات الصيانة', '2.5 يوم', '3 أيام', 8.2, false, true, true),
('weekly', 9, 'عدد إعادة فتح طلب', '0', '0', 0, true, true, true),
('weekly', 10, 'جودة إدارة المرافق', '80%', '80%', 1.8, true, true, false),
('weekly', 11, 'معدل التحول', '2%', '2%', 1.5, true, true, false),
('weekly', 12, 'نسبة الرضا عن التسليم', '80%', '80%', 2.3, true, true, false),
('weekly', 13, 'عدد العملاء المرشحين', '584', '584', 0, true, true, false),
('weekly', 14, 'المساهمة في المبيعات', '5%', '5%', 2.1, true, true, false);

-- إدراج المؤشرات السنوية الصحيحة
INSERT INTO public.metrics (period, metric_index, title, value, target, change, is_positive, reached_target, is_lower_better) VALUES
('yearly', 0, 'نسبة الترشيح للعملاء الجدد', '68%', '65%', 4.6, true, true, false),
('yearly', 1, 'نسبة الترشيح بعد السنة', '70%', '65%', 7.7, true, true, false),
('yearly', 2, 'نسبة الترشيح للعملاء القدامى', '35%', '30%', 16.7, true, true, false),
('yearly', 3, 'جودة التسليم', '99%', '100%', 2.5, true, false, false),
('yearly', 4, 'جودة الصيانة', '98%', '100%', 3.8, true, false, false),
('yearly', 5, 'عدد الثواني للرد', '2.5 ثانية', '3 ثواني', 16.7, false, true, true),
('yearly', 6, 'معدل الرد على المكالمات', '16%', '80%', 20.0, false, false, false),
('yearly', 7, 'راحة العميل (CSAT)', '78%', '70%', 11.4, true, true, false),
('yearly', 8, 'سرعة إغلاق طلبات الصيانة', '2.2 يوم', '3 أيام', 26.7, false, true, true),
('yearly', 9, 'عدد إعادة فتح طلب', '2', '0', 200, false, false, true),
('yearly', 10, 'جودة إدارة المرافق', '85%', '80%', 6.25, true, true, false),
('yearly', 11, 'معدل التحول', '2.5%', '2%', 25.0, true, true, false),
('yearly', 12, 'نسبة الرضا عن التسليم', '85%', '80%', 6.25, true, true, false),
('yearly', 13, 'عدد العملاء المرشحين', '7008', '7008', 0, true, true, false),
('yearly', 14, 'المساهمة في المبيعات', '7%', '5%', 40.0, true, true, false);

-- تحديث بيانات خدمة العملاء
UPDATE public.customer_service SET
  complaints = 28,
  contact_requests = 42,
  maintenance_requests = 65,
  inquiries = 58,
  office_interested = 34,
  projects_interested = 38,
  customers_interested = 42,
  total = 307,
  general_inquiries = 20,
  document_requests = 10,
  deed_inquiries = 8,
  apartment_rentals = 12,
  sold_projects = 8,
  cancelled_maintenance = 5,
  resolved_maintenance = 45,
  in_progress_maintenance = 15,
  updated_at = NOW()
WHERE period = 'weekly';

UPDATE public.customer_service SET
  complaints = 1456,
  contact_requests = 2184,
  maintenance_requests = 3380,
  inquiries = 3016,
  office_interested = 1768,
  projects_interested = 1976,
  customers_interested = 2184,
  total = 15964,
  general_inquiries = 1040,
  document_requests = 520,
  deed_inquiries = 416,
  apartment_rentals = 624,
  sold_projects = 416,
  cancelled_maintenance = 260,
  resolved_maintenance = 2340,
  in_progress_maintenance = 780,
  updated_at = NOW()
WHERE period = 'yearly';

-- تحديث الوقت
UPDATE public.metrics SET updated_at = NOW();

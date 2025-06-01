
-- حذف الجداول الموجودة إن وجدت
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS satisfaction CASCADE;
DROP TABLE IF EXISTS customer_service CASCADE;
DROP TABLE IF EXISTS metrics CASCADE;

-- جدول المؤشرات (15 مؤشر)
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
  metric_index INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  value VARCHAR(50) NOT NULL,
  target VARCHAR(50) NOT NULL,
  change DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_positive BOOLEAN NOT NULL DEFAULT false,
  reached_target BOOLEAN NOT NULL DEFAULT false,
  is_lower_better BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(period, metric_index)
);

-- جدول خدمة العملاء الكامل
CREATE TABLE customer_service (
  id SERIAL PRIMARY KEY,
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

-- جدول رضا العملاء الكامل
CREATE TABLE satisfaction (
  id SERIAL PRIMARY KEY,
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

-- جدول ملاحظات العملاء
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
  text TEXT NOT NULL,
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX idx_metrics_period ON metrics(period);
CREATE INDEX idx_metrics_period_index ON metrics(period, metric_index);
CREATE INDEX idx_customer_service_period ON customer_service(period);
CREATE INDEX idx_satisfaction_period_category ON satisfaction(period, category);
CREATE INDEX idx_comments_period ON comments(period);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- إنشاء الدوال لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء المحفزات لتحديث updated_at
CREATE TRIGGER update_metrics_updated_at 
  BEFORE UPDATE ON metrics
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_service_updated_at 
  BEFORE UPDATE ON customer_service
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_satisfaction_updated_at 
  BEFORE UPDATE ON satisfaction
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- إدراج البيانات الافتراضية للفترة الأسبوعية
INSERT INTO metrics (period, metric_index, title, value, target, change, is_positive, reached_target, is_lower_better) VALUES
('weekly', 0, 'معدل الرضا العام', '85%', '85%', 0, true, true, false),
('weekly', 1, 'معدل حل المشاكل من أول مرة', '78%', '80%', -2.5, false, false, false),
('weekly', 2, 'متوسط وقت الاستجابة (دقيقة)', '2.5', '3.0', 16.7, true, true, true),
('weekly', 3, 'معدل تجديد العقود', '92%', '90%', 2.2, true, true, false),
('weekly', 4, 'عدد الشكاوى الجديدة', '15', '20', 25, true, true, true),
('weekly', 5, 'معدل الاستجابة للطلبات', '95%', '90%', 5.6, true, true, false),
('weekly', 6, 'نسبة العملاء المتجددين', '88%', '85%', 3.5, true, true, false),
('weekly', 7, 'متوسط تقييم الخدمة', '4.2', '4.0', 5, true, true, false),
('weekly', 8, 'عدد المشاريع المكتملة', '12', '10', 20, true, true, false),
('weekly', 9, 'معدل إنجاز الصيانة', '89%', '85%', 4.7, true, true, false),
('weekly', 10, 'عدد العملاء الجدد', '25', '20', 25, true, true, false),
('weekly', 11, 'نسبة تحويل العملاء المحتملين', '65%', '60%', 8.3, true, true, false),
('weekly', 12, 'معدل الاحتفاظ بالعملاء', '94%', '90%', 4.4, true, true, false),
('weekly', 13, 'متوسط قيمة المشروع', '150000', '140000', 7.1, true, true, false),
('weekly', 14, 'نسبة الشكاوى المحلولة', '96%', '95%', 1.1, true, true, false);

-- إدراج البيانات الافتراضية للفترة السنوية
INSERT INTO metrics (period, metric_index, title, value, target, change, is_positive, reached_target, is_lower_better) VALUES
('yearly', 0, 'معدل الرضا العام', '87%', '85%', 2.4, true, true, false),
('yearly', 1, 'معدل حل المشاكل من أول مرة', '82%', '80%', 2.5, true, true, false),
('yearly', 2, 'متوسط وقت الاستجابة (دقيقة)', '2.2', '3.0', 26.7, true, true, true),
('yearly', 3, 'معدل تجديد العقود', '91%', '90%', 1.1, true, true, false),
('yearly', 4, 'عدد الشكاوى الجديدة', '180', '240', 25, true, true, true),
('yearly', 5, 'معدل الاستجابة للطلبات', '93%', '90%', 3.3, true, true, false),
('yearly', 6, 'نسبة العملاء المتجددين', '89%', '85%', 4.7, true, true, false),
('yearly', 7, 'متوسط تقييم الخدمة', '4.3', '4.0', 7.5, true, true, false),
('yearly', 8, 'عدد المشاريع المكتملة', '145', '120', 20.8, true, true, false),
('yearly', 9, 'معدل إنجاز الصيانة', '91%', '85%', 7.1, true, true, false),
('yearly', 10, 'عدد العملاء الجدد', '320', '300', 6.7, true, true, false),
('yearly', 11, 'نسبة تحويل العملاء المحتملين', '68%', '60%', 13.3, true, true, false),
('yearly', 12, 'معدل الاحتفاظ بالعملاء', '95%', '90%', 5.6, true, true, false),
('yearly', 13, 'متوسط قيمة المشروع', '155000', '140000', 10.7, true, true, false),
('yearly', 14, 'نسبة الشكاوى المحلولة', '97%', '95%', 2.1, true, true, false);

-- إدراج بيانات خدمة العملاء للفترة الأسبوعية
INSERT INTO customer_service (period, complaints, contact_requests, maintenance_requests, inquiries, office_interested, projects_interested, customers_interested, total, general_inquiries, document_requests, deed_inquiries, apartment_rentals, sold_projects, cancelled_maintenance, resolved_maintenance, in_progress_maintenance) VALUES
('weekly', 28, 45, 65, 58, 34, 38, 42, 310, 20, 10, 8, 12, 8, 5, 45, 15);

-- إدراج بيانات خدمة العملاء للفترة السنوية
INSERT INTO customer_service (period, complaints, contact_requests, maintenance_requests, inquiries, office_interested, projects_interested, customers_interested, total, general_inquiries, document_requests, deed_inquiries, apartment_rentals, sold_projects, cancelled_maintenance, resolved_maintenance, in_progress_maintenance) VALUES
('yearly', 340, 580, 720, 650, 420, 480, 520, 3710, 240, 120, 95, 145, 96, 60, 540, 120);

-- إدراج بيانات رضا العملاء للفترة الأسبوعية
INSERT INTO satisfaction (period, category, very_happy, happy, neutral, unhappy, very_unhappy) VALUES
('weekly', 'serviceQuality', 45, 32, 18, 8, 2),
('weekly', 'closureTime', 38, 35, 20, 10, 3),
('weekly', 'firstTimeResolution', 42, 30, 22, 9, 2);

-- إدراج بيانات رضا العملاء للفترة السنوية
INSERT INTO satisfaction (period, category, very_happy, happy, neutral, unhappy, very_unhappy) VALUES
('yearly', 'serviceQuality', 520, 380, 215, 95, 25),
('yearly', 'closureTime', 465, 420, 240, 120, 35),
('yearly', 'firstTimeResolution', 490, 360, 265, 108, 24);

-- إدراج تعليقات تجريبية
INSERT INTO comments (period, text, username) VALUES
('weekly', 'خدمة ممتازة وسرعة في الاستجابة', 'أحمد محمد'),
('weekly', 'تم حل المشكلة بشكل سريع ومهني', 'سارة عبدالله'),
('weekly', 'نتمنى تطوير أكثر في خدمة العملاء', 'محمد علي'),
('yearly', 'تحسن ملحوظ في الخدمة هذا العام', 'فاطمة أحمد'),
('yearly', 'فريق محترف ومتعاون', 'عبدالرحمن سالم');

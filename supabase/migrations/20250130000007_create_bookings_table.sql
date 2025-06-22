
-- إنشاء جدول الحجوزات
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(255) UNIQUE NOT NULL,
    booking_date DATE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    project VARCHAR(255) NOT NULL,
    building VARCHAR(100),
    unit VARCHAR(100) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    sale_type VARCHAR(100) NOT NULL,
    unit_value DECIMAL(12,2) DEFAULT 0,
    transfer_date DATE,
    sales_employee VARCHAR(255),
    construction_end_date DATE,
    final_receipt_date DATE,
    electricity_transfer_date DATE,
    water_transfer_date DATE,
    delivery_date DATE,
    status VARCHAR(100) DEFAULT 'مجدول',
    status_sales_filled BOOLEAN DEFAULT FALSE,
    status_projects_filled BOOLEAN DEFAULT FALSE,
    status_customer_filled BOOLEAN DEFAULT FALSE,
    is_evaluated BOOLEAN DEFAULT FALSE,
    evaluation_score INTEGER CHECK (evaluation_score >= 1 AND evaluation_score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255)
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_project ON bookings(project);

-- إعداد RLS (Row Level Security)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة - يمكن لجميع المستخدمين المعرفين قراءة البيانات
CREATE POLICY "bookings_select_policy" ON bookings FOR SELECT USING (auth.uid() IS NOT NULL);

-- سياسة للإدراج - يمكن لجميع المستخدمين المعرفين إدراج البيانات
CREATE POLICY "bookings_insert_policy" ON bookings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- سياسة للتحديث - يمكن لجميع المستخدمين المعرفين تحديث البيانات
CREATE POLICY "bookings_update_policy" ON bookings FOR UPDATE USING (auth.uid() IS NOT NULL);

-- سياسة للحذف - يمكن لجميع المستخدمين المعرفين حذف البيانات
CREATE POLICY "bookings_delete_policy" ON bookings FOR DELETE USING (auth.uid() IS NOT NULL);

-- تحديث تلقائي لحقل updated_at
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at_trigger
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_bookings_updated_at();

-- إدراج بعض البيانات التجريبية للاختبار
INSERT INTO bookings (
    booking_id, booking_date, customer_name, project, building, unit,
    payment_method, sale_type, unit_value, transfer_date, sales_employee,
    construction_end_date, final_receipt_date, electricity_transfer_date,
    water_transfer_date, delivery_date, status, status_sales_filled,
    status_projects_filled, status_customer_filled, is_evaluated,
    evaluation_score, created_by
) VALUES
(
    'booking_1', '2025-01-15', 'أحمد محمد السالم', 'مشروع النخيل', 'A', '101',
    'نقدي', 'جاهز', 850000, '2025-01-20', 'محمد أحمد',
    '2025-01-25', '2025-01-30', '2025-02-05', '2025-02-07', '2025-02-10',
    'مكتمل', true, true, true, true, 9, 'admin'
),
(
    'booking_2', '2025-01-18', 'فاطمة عبدالله', 'مشروع الياسمين', 'B', '205',
    'تحويل بنكي', 'على الخارطة', 750000, '2025-01-25', 'سارة محمد',
    '2025-03-15', '2025-03-20', '2025-03-25', '2025-03-27', NULL,
    'قيد التنفيذ', false, false, true, false, NULL, 'admin'
),
(
    'booking_3', '2025-01-22', 'عبدالرحمن الشهري', 'مشروع الورود', 'C', '304',
    'نقدي', 'جاهز', 920000, '2025-01-28', 'أحمد عبدالله',
    '2025-02-10', '2025-02-15', '2025-02-20', '2025-02-22', '2025-02-25',
    'مكتمل', true, true, true, true, 8, 'admin'
),
(
    'booking_4', '2025-01-10', 'خالد النصر', 'مشروع السكن الراقي', 'D', '102',
    'نقدي', 'جاهز', 1200000, '2025-01-15', 'علي محمد',
    '2025-01-20', '2025-01-25', '2025-01-30', '2025-02-01', '2025-02-05',
    'مكتمل', true, true, true, true, 10, 'admin'
),
(
    'booking_5', '2025-01-25', 'نورا الخالد', 'مشروع المدينة الجديدة', 'E', '501',
    'تحويل بنكي', 'على الخارطة', 680000, '2025-02-01', 'ريم أحمد',
    '2025-04-01', '2025-04-05', '2025-04-10', '2025-04-12', NULL,
    'مجدول', true, false, true, false, NULL, 'admin'
);

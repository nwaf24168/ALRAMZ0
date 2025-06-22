
-- إضافة سياسات الأمان لجدول سجلات الاستقبال
CREATE POLICY "Enable read access for all users" ON "public"."reception_records"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for all users" ON "public"."reception_records"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."reception_records"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON "public"."reception_records"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

-- إضافة سياسات الأمان لجدول مكالمات الجودة
CREATE POLICY "Enable read access for all users" ON "public"."quality_calls"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for all users" ON "public"."quality_calls"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."quality_calls"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON "public"."quality_calls"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

-- تفعيل RLS على الجداول إذا لم تكن مفعلة
ALTER TABLE "public"."reception_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."quality_calls" ENABLE ROW LEVEL SECURITY;

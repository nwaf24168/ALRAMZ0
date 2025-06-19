
-- إزالة علامة النسبة المئوية من المؤشرات التي هي أرقام صحيحة وليست نسب مئوية

-- للفترة الأسبوعية
UPDATE metrics 
SET value = REPLACE(value, '%', '')
WHERE title IN (
  'عدد الثواني للرد',
  'سرعة إغلاق طلبات الصيانة',
  'عدد إعادة فتح طلب',
  'عدد العملاء المرشحين'
) AND period = 'weekly';

-- للفترة السنوية  
UPDATE metrics 
SET value = REPLACE(value, '%', '')
WHERE title IN (
  'عدد الثواني للرد',
  'سرعة إغلاق طلبات الصيانة',
  'عدد إعادة فتح طلب',
  'عدد العملاء المرشحين'
) AND period = 'yearly';

-- تحديث الأهداف أيضاً لإزالة علامة النسبة المئوية إذا كانت موجودة
UPDATE metrics 
SET target = CASE 
  WHEN title = 'عدد الثواني للرد' THEN '3 ثواني'
  WHEN title = 'سرعة إغلاق طلبات الصيانة' THEN '5 أيام'
  WHEN title = 'عدد إعادة فتح طلب' THEN '0'
  WHEN title = 'عدد العملاء المرشحين' AND period = 'weekly' THEN '584'
  WHEN title = 'عدد العملاء المرشحين' AND period = 'yearly' THEN '7008'
  ELSE target
END
WHERE title IN (
  'عدد الثواني للرد',
  'سرعة إغلاق طلبات الصيانة',
  'عدد إعادة فتح طلب',
  'عدد العملاء المرشحين'
);

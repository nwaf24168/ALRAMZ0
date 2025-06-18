# دليل النشر على GitHub

## خطوات رفع المشروع على GitHub

### 1. تهيئة مستودع Git جديد

```bash
git init
git add .
git commit -m "Initial commit: Al-Ramz Real Estate Dashboard"
```

### 2. ربط المستودع بـ GitHub

```bash
# إنشاء مستودع جديد على GitHub أولاً، ثم تشغيل الأوامر التالية
git remote add origin https://github.com/[username]/alramz-dashboard.git
git branch -M main
git push -u origin main
```

### 3. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```env
# Supabase Configuration (Replace with your actual values)
VITE_SUPABASE_URL=https://gfzeqvxsmeeehvqixidp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemVxdnhzbWVlZWh2cWl4aWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NjYzNjMsImV4cCI6MjA2NDM0MjM2M30.ubs51a9Vkx2FQ0UGqk2W5TXuzDs_xwEy4DXAuZ2AZ_A

# For production deployment
NODE_ENV=production
PORT=5000
```

### 4. إعداد scripts النشر في package.json

أضف هذه المقاطع إلى `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "preview": "vite preview"
  }
}
```

## خيارات النشر

### 1. Vercel (موصى به)

1. قم بربط حسابك في Vercel بـ GitHub
2. اختر المستودع
3. أضف متغيرات البيئة في لوحة Vercel
4. انشر التطبيق

### 2. Netlify

1. قم بربط المستودع مع Netlify
2. ضع أمر البناء: `npm run build`
3. مجلد النشر: `dist`
4. أضف متغيرات البيئة

### 3. Railway

1. قم بربط المستودع مع Railway
2. سيتم اكتشاف الإعدادات تلقائياً
3. أضف متغيرات البيئة
4. انشر التطبيق

## الملفات المطلوبة للنشر

تأكد من وجود هذه الملفات:

- ✅ `package.json` - يحتوي على التبعيات والمقاطع
- ✅ `.gitignore` - لتجاهل الملفات غير المطلوبة  
- ✅ `README.md` - وثائق المشروع
- ✅ `vite.config.ts` - إعدادات Vite
- ✅ `tailwind.config.ts` - إعدادات Tailwind
- ✅ `tsconfig.json` - إعدادات TypeScript

## متغيرات البيئة المطلوبة للنشر

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
PORT=5000
```

## مشاكل شائعة وحلولها

### 1. خطأ في البناء (Build Error)
- تأكد من تثبيت جميع التبعيات
- تحقق من صحة متغيرات البيئة

### 2. خطأ في الاتصال بقاعدة البيانات
- تأكد من صحة رابط Supabase
- تحقق من صلاحيات API Key

### 3. مشاكل الخطوط العربية
- تأكد من تحميل خطوط Cairo من Google Fonts
- تحقق من إعدادات Tailwind CSS

## اختبار النشر محلياً

```bash
# بناء المشروع
npm run build

# تشغيل النسخة المبنية
npm run preview
```

## الدعم

إذا واجهت أي مشاكل في النشر، تأكد من:
1. صحة متغيرات البيئة
2. تطابق إصدارات Node.js
3. صحة إعدادات قاعدة البيانات
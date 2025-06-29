
import { Resend } from 'resend';

const resend = new Resend('re_h7GBDBRs_DHpqNNC9cuARpejas9z1QZxQ');

// قائمة الإيميلات للموظفين
const EMPLOYEE_EMAILS = [
  'nn121240@gmail.com', // إيميل الدعم الفني
  'nn121240@gmail.com', // إيميل المدير
  'nn121240@gmail.com', // إيميل قسم الشكاوى
  'nn121240@gmail.com', // إيميل قسم التسليم
];

// إرسال إيميل للشكاوى
export async function sendComplaintEmail(data: {
  type: 'new' | 'update' | 'status_change';
  complaint: {
    id: string;
    customerName: string;
    project?: string;
    status: string;
    description: string;
    priority?: string;
    updatedBy?: string;
    previousStatus?: string;
  };
}) {
  // في البيئة المحلية، نسجل فقط دون إرسال فعلي
  if (import.meta.env.DEV) {
    console.log('تم محاكاة إرسال إيميل الشكوى:', {
      type: data.type,
      complaint: data.complaint.customerName,
      id: data.complaint.id
    });
    return { data: null, error: null };
  }

  try {
    const { type, complaint } = data;
    
    let subject = '';
    let htmlContent = '';
    
    switch (type) {
      case 'new':
        subject = `شكوى جديدة - ${complaint.customerName} - ${complaint.id}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2 style="color: #e74c3c;">شكوى جديدة</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>رقم الشكوى:</strong> ${complaint.id}</p>
              <p><strong>اسم العميل:</strong> ${complaint.customerName}</p>
              <p><strong>المشروع:</strong> ${complaint.project || 'غير محدد'}</p>
              <p><strong>الأولوية:</strong> ${complaint.priority || 'متوسطة'}</p>
              <p><strong>الحالة:</strong> ${complaint.status}</p>
              <p><strong>وصف الشكوى:</strong></p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #e74c3c;">
                ${complaint.description}
              </div>
            </div>
            <p style="color: #666;">تم إنشاء هذه الشكوى في ${new Date().toLocaleString('ar-SA')}</p>
          </div>
        `;
        break;
        
      case 'update':
        subject = `تحديث شكوى - ${complaint.customerName} - ${complaint.id}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2 style="color: #f39c12;">تحديث شكوى</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>رقم الشكوى:</strong> ${complaint.id}</p>
              <p><strong>اسم العميل:</strong> ${complaint.customerName}</p>
              <p><strong>المشروع:</strong> ${complaint.project || 'غير محدد'}</p>
              <p><strong>الحالة الحالية:</strong> ${complaint.status}</p>
              <p><strong>محدث بواسطة:</strong> ${complaint.updatedBy || 'غير محدد'}</p>
            </div>
            <p style="color: #666;">تم التحديث في ${new Date().toLocaleString('ar-SA')}</p>
          </div>
        `;
        break;
        
      case 'status_change':
        subject = `تغيير حالة شكوى - ${complaint.customerName} - ${complaint.id}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2 style="color: #3498db;">تغيير حالة شكوى</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>رقم الشكوى:</strong> ${complaint.id}</p>
              <p><strong>اسم العميل:</strong> ${complaint.customerName}</p>
              <p><strong>المشروع:</strong> ${complaint.project || 'غير محدد'}</p>
              <p><strong>الحالة السابقة:</strong> <span style="color: #e74c3c;">${complaint.previousStatus || 'غير محدد'}</span></p>
              <p><strong>الحالة الجديدة:</strong> <span style="color: #27ae60;">${complaint.status}</span></p>
              <p><strong>محدث بواسطة:</strong> ${complaint.updatedBy || 'غير محدد'}</p>
            </div>
            <p style="color: #666;">تم التحديث في ${new Date().toLocaleString('ar-SA')}</p>
          </div>
        `;
        break;
    }

    // محاولة إرسال الإيميل مع timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني timeout

    const response = await Promise.race([
      resend.emails.send({
        from: 'نظام إدارة الشكاوى <noreply@alramz.com>',
        to: EMPLOYEE_EMAILS,
        subject,
        html: htmlContent,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 10000)
      )
    ]);

    clearTimeout(timeoutId);
    console.log('تم إرسال إيميل الشكوى بنجاح:', response);
    return response;
  } catch (error) {
    console.error('خطأ في إرسال إيميل الشكوى:', error);
    // لا نرمي الخطأ لتجنب توقف التطبيق
    return { data: null, error: error };
  }
}

// إرسال إيميل للحجوزات
export async function sendBookingEmail(data: {
  type: 'new' | 'update' | 'status_change';
  booking: {
    id: number | string;
    customerName: string;
    project?: string;
    unit?: string;
    status: string;
    booking_date?: string;
    handover_date?: string;
    updatedBy?: string;
    previousStatus?: string;
  };
}) {
  // في البيئة المحلية، نسجل فقط دون إرسال فعلي
  if (import.meta.env.DEV) {
    console.log('تم محاكاة إرسال إيميل الحجز:', {
      type: data.type,
      booking: data.booking.customerName,
      id: data.booking.id
    });
    return { data: null, error: null };
  }

  try {
    const { type, booking } = data;
    
    let subject = '';
    let htmlContent = '';
    
    switch (type) {
      case 'new':
        subject = `حجز جديد - ${booking.customerName} - ${booking.id}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2 style="color: #27ae60;">حجز جديد</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>رقم الحجز:</strong> ${booking.id}</p>
              <p><strong>اسم العميل:</strong> ${booking.customerName}</p>
              <p><strong>المشروع:</strong> ${booking.project || 'غير محدد'}</p>
              <p><strong>الوحدة:</strong> ${booking.unit || 'غير محدد'}</p>
              <p><strong>الحالة:</strong> ${booking.status}</p>
              <p><strong>تاريخ الحجز:</strong> ${booking.booking_date || 'غير محدد'}</p>
              <p><strong>تاريخ الإفراغ:</strong> ${booking.handover_date || 'غير محدد'}</p>
            </div>
            <p style="color: #666;">تم إنشاء هذا الحجز في ${new Date().toLocaleString('ar-SA')}</p>
          </div>
        `;
        break;
        
      case 'update':
        subject = `تحديث حجز - ${booking.customerName} - ${booking.id}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2 style="color: #f39c12;">تحديث حجز</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>رقم الحجز:</strong> ${booking.id}</p>
              <p><strong>اسم العميل:</strong> ${booking.customerName}</p>
              <p><strong>المشروع:</strong> ${booking.project || 'غير محدد'}</p>
              <p><strong>الوحدة:</strong> ${booking.unit || 'غير محدد'}</p>
              <p><strong>الحالة الحالية:</strong> ${booking.status}</p>
              <p><strong>محدث بواسطة:</strong> ${booking.updatedBy || 'غير محدد'}</p>
            </div>
            <p style="color: #666;">تم التحديث في ${new Date().toLocaleString('ar-SA')}</p>
          </div>
        `;
        break;
        
      case 'status_change':
        subject = `تغيير حالة حجز - ${booking.customerName} - ${booking.id}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2 style="color: #3498db;">تغيير حالة حجز</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>رقم الحجز:</strong> ${booking.id}</p>
              <p><strong>اسم العميل:</strong> ${booking.customerName}</p>
              <p><strong>المشروع:</strong> ${booking.project || 'غير محدد'}</p>
              <p><strong>الوحدة:</strong> ${booking.unit || 'غير محدد'}</p>
              <p><strong>الحالة السابقة:</strong> <span style="color: #e74c3c;">${booking.previousStatus || 'غير محدد'}</span></p>
              <p><strong>الحالة الجديدة:</strong> <span style="color: #27ae60;">${booking.status}</span></p>
              <p><strong>محدث بواسطة:</strong> ${booking.updatedBy || 'غير محدد'}</p>
            </div>
            <p style="color: #666;">تم التحديث في ${new Date().toLocaleString('ar-SA')}</p>
          </div>
        `;
        break;
    }

    // محاولة إرسال الإيميل مع timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني timeout

    const response = await Promise.race([
      resend.emails.send({
        from: 'نظام إدارة التسليم <noreply@alramz.com>',
        to: EMPLOYEE_EMAILS,
        subject,
        html: htmlContent,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 10000)
      )
    ]);

    clearTimeout(timeoutId);
    console.log('تم إرسال إيميل الحجز بنجاح:', response);
    return response;
  } catch (error) {
    console.error('خطأ في إرسال إيميل الحجز:', error);
    // لا نرمي الخطأ لتجنب توقف التطبيق
    return { data: null, error: error };
  }
}

// دالة عامة لإرسال إيميل مخصص
export async function sendCustomEmail(data: {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const response = await resend.emails.send({
      from: data.from || 'نظام الرمز العقارية <noreply@alramz.com>',
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    console.log('تم إرسال الإيميل المخصص بنجاح:', response);
    return response;
  } catch (error) {
    console.error('خطأ في إرسال الإيميل المخصص:', error);
    throw error;
  }
}

// دالة لإرسال تقرير يومي
export async function sendDailyReport(data: {
  complaints: number;
  bookings: number;
  completedTasks: number;
  pendingTasks: number;
}) {
  try {
    const subject = `التقرير اليومي - ${new Date().toLocaleDateString('ar-SA')}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #2c3e50;">التقرير اليومي</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>إحصائيات اليوم:</h3>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin: 10px 0; padding: 10px; background-color: #e3f2fd; border-radius: 5px;">
              <strong>الشكاوى الجديدة:</strong> ${data.complaints}
            </li>
            <li style="margin: 10px 0; padding: 10px; background-color: #e8f5e8; border-radius: 5px;">
              <strong>الحجوزات الجديدة:</strong> ${data.bookings}
            </li>
            <li style="margin: 10px 0; padding: 10px; background-color: #fff3e0; border-radius: 5px;">
              <strong>المهام المكتملة:</strong> ${data.completedTasks}
            </li>
            <li style="margin: 10px 0; padding: 10px; background-color: #ffebee; border-radius: 5px;">
              <strong>المهام المعلقة:</strong> ${data.pendingTasks}
            </li>
          </ul>
        </div>
        <p style="color: #666;">تم إنشاء هذا التقرير في ${new Date().toLocaleString('ar-SA')}</p>
      </div>
    `;

    const response = await resend.emails.send({
      from: 'نظام التقارير <reports@alramz.com>',
      to: EMPLOYEE_EMAILS,
      subject,
      html: htmlContent,
    });

    console.log('تم إرسال التقرير اليومي بنجاح:', response);
    return response;
  } catch (error) {
    console.error('خطأ في إرسال التقرير اليومي:', error);
    throw error;
  }
}

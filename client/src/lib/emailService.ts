
import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// إيميلات موظفي الشكاوى
const complaintEmployeeEmails = [
  'a.alzahrani@alramzre.com',
  'k.alothiameen@alramzre.com', 
  'a.alhuthlul@alramzre.com',
  'f.alkharaan@alramzre.com',
  'n.alshehri@alramzre.com'
];

// إيميلات إدارات التسليم
const deliveryEmails = {
  sales: [
    'sales1@alramzre.com',
    'sales2@alramzre.com'
  ],
  projects: [
    'projects1@alramzre.com',
    'projects2@alramzre.com'
  ],
  customerService: [
    'customerservice1@alramzre.com',
    'customerservice2@alramzre.com'
  ]
};

export const sendComplaintEmail = async ({
  type,
  complaint
}: {
  type: 'new' | 'update';
  complaint: {
    id: string;
    customerName: string;
    status: string;
    description: string;
    project: string;
    unitNumber: string;
    updatedBy?: string;
  };
}) => {
  try {
    const subject = type === 'new' 
      ? `📢 شكوى جديدة - ${complaint.id}` 
      : `✏️ تم تحديث شكوى - ${complaint.id}`;

    const content = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2563eb;">${type === 'new' ? 'تمت إضافة شكوى جديدة' : 'تم تحديث الشكوى'}</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>رقم التذكرة:</strong> ${complaint.id}</p>
          <p><strong>اسم العميل:</strong> ${complaint.customerName}</p>
          <p><strong>المشروع:</strong> ${complaint.project}</p>
          <p><strong>رقم الوحدة:</strong> ${complaint.unitNumber}</p>
          <p><strong>الحالة:</strong> ${complaint.status}</p>
          <p><strong>الوصف:</strong> ${complaint.description}</p>
          ${type === 'update' ? `<p><strong>تم التحديث بواسطة:</strong> ${complaint.updatedBy}</p>` : ''}
        </div>
        <p style="color: #64748b; font-size: 14px;">هذا بريد تلقائي - الرجاء عدم الرد عليه</p>
      </div>
    `;

    const email = await resend.emails.send({
      from: 'نظام الشكاوى - الرمز <noreply@alramz.sa>',
      to: complaintEmployeeEmails,
      subject,
      html: content,
    });

    return { success: true, data: email };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendDeliveryStatusEmail = async ({
  type,
  booking,
  fromStage,
  toStage
}: {
  type: 'status_change' | 'stage_complete';
  booking: {
    id: string;
    customerName: string;
    project: string;
    building: string;
    unit: string;
    status: string;
    updatedBy?: string;
  };
  fromStage?: string;
  toStage: string;
}) => {
  try {
    let recipients: string[] = [];
    let subject = '';
    let content = '';

    // تحديد المستقبلين والمحتوى بناءً على المرحلة
    switch (toStage) {
      case 'في إدارة المشاريع':
        recipients = deliveryEmails.projects;
        subject = `📋 حجز جديد جاهز للمراجعة - المشاريع`;
        content = `
          <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #2563eb;">حجز جديد جاهز للمراجعة في إدارة المشاريع</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>رقم الحجز:</strong> ${booking.id}</p>
              <p><strong>اسم العميل:</strong> ${booking.customerName}</p>
              <p><strong>المشروع:</strong> ${booking.project}</p>
              <p><strong>العمارة/الوحدة:</strong> ${booking.building}/${booking.unit}</p>
              <p><strong>الحالة الحالية:</strong> ${booking.status}</p>
              <p><strong>تم الانتهاء من مرحلة:</strong> المبيعات</p>
              ${booking.updatedBy ? `<p><strong>تم التحديث بواسطة:</strong> ${booking.updatedBy}</p>` : ''}
            </div>
            <p style="color: #64748b; font-size: 14px;">الرجاء مراجعة الحجز واتخاذ الإجراءات اللازمة.</p>
          </div>
        `;
        break;

      case 'في راحة العملاء':
        recipients = deliveryEmails.customerService;
        subject = `🏠 حجز جاهز للتسليم - راحة العملاء`;
        content = `
          <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #10b981;">حجز جاهز للتسليم</h2>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p><strong>رقم الحجز:</strong> ${booking.id}</p>
              <p><strong>اسم العميل:</strong> ${booking.customerName}</p>
              <p><strong>المشروع:</strong> ${booking.project}</p>
              <p><strong>العمارة/الوحدة:</strong> ${booking.building}/${booking.unit}</p>
              <p><strong>الحالة الحالية:</strong> ${booking.status}</p>
              <p><strong>تم الانتهاء من مرحلة:</strong> إدارة المشاريع</p>
              ${booking.updatedBy ? `<p><strong>تم التحديث بواسطة:</strong> ${booking.updatedBy}</p>` : ''}
            </div>
            <p style="color: #064e3b; font-size: 14px;">الحجز جاهز للتسليم للعميل. الرجاء التواصل مع العميل لتحديد موعد التسليم.</p>
          </div>
        `;
        break;

      case 'مكتمل':
        recipients = [...deliveryEmails.sales, ...deliveryEmails.projects, ...deliveryEmails.customerService];
        subject = `✅ تم تسليم الحجز بنجاح`;
        content = `
          <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #059669;">تم تسليم الحجز بنجاح</h2>
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <p><strong>رقم الحجز:</strong> ${booking.id}</p>
              <p><strong>اسم العميل:</strong> ${booking.customerName}</p>
              <p><strong>المشروع:</strong> ${booking.project}</p>
              <p><strong>العمارة/الوحدة:</strong> ${booking.building}/${booking.unit}</p>
              <p><strong>الحالة:</strong> مكتمل</p>
              ${booking.updatedBy ? `<p><strong>تم التسليم بواسطة:</strong> ${booking.updatedBy}</p>` : ''}
            </div>
            <p style="color: #065f46; font-size: 14px;">تهانينا! تم تسليم الحجز للعميل بنجاح.</p>
          </div>
        `;
        break;

      default:
        return { success: false, error: 'مرحلة غير معروفة' };
    }

    if (recipients.length === 0) {
      return { success: false, error: 'لا توجد إيميلات مستقبلة' };
    }

    const email = await resend.emails.send({
      from: 'نظام التسليم - الرمز <noreply@alramz.sa>',
      to: recipients,
      subject,
      html: content,
    });

    return { success: true, data: email };
  } catch (error) {
    console.error('Error sending delivery email:', error);
    return { success: false, error };
  }
};

export const sendComplaintStatusEmail = async ({
  complaint,
  oldStatus,
  newStatus,
  updatedBy
}: {
  complaint: {
    id: string;
    customerName: string;
    project: string;
    unitNumber: string;
    description: string;
  };
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
}) => {
  try {
    const subject = `🔄 تم تحديث حالة الشكوى - ${complaint.id}`;
    
    const content = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #f59e0b;">تم تحديث حالة الشكوى</h2>
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p><strong>رقم التذكرة:</strong> ${complaint.id}</p>
          <p><strong>اسم العميل:</strong> ${complaint.customerName}</p>
          <p><strong>المشروع:</strong> ${complaint.project}</p>
          <p><strong>رقم الوحدة:</strong> ${complaint.unitNumber}</p>
          <p><strong>الحالة السابقة:</strong> <span style="color: #dc2626;">${oldStatus}</span></p>
          <p><strong>الحالة الجديدة:</strong> <span style="color: #16a34a;">${newStatus}</span></p>
          <p><strong>تم التحديث بواسطة:</strong> ${updatedBy}</p>
          <p><strong>وصف الشكوى:</strong> ${complaint.description}</p>
        </div>
        <p style="color: #92400e; font-size: 14px;">تم تحديث حالة الشكوى. الرجاء المتابعة حسب الحالة الجديدة.</p>
      </div>
    `;

    const email = await resend.emails.send({
      from: 'نظام الشكاوى - الرمز <noreply@alramz.sa>',
      to: complaintEmployeeEmails,
      subject,
      html: content,
    });

    return { success: true, data: email };
  } catch (error) {
    console.error('Error sending complaint status email:', error);
    return { success: false, error };
  }
};


import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

const employeeEmails = [
  'a.alzahrani@alramzre.com',
  'k.alothiameen@alramzre.com', 
  'a.alhuthlul@alramzre.com',
  'f.alkharaan@alramzre.com',
  'n.alshehri@alramzre.com'
];

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
      to: employeeEmails,
      subject,
      html: content,
    });

    return { success: true, data: email };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

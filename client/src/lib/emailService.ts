
import { Resend } from 'resend';

const resend = new Resend('re_h7GBDBRs_DHpqNNC9cuARpejas9z1QZxQ');

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
    requestNumber?: string;
  };
}) => {
  try {
    const subject = type === 'new' 
      ? `📢 شكوى جديدة - ${complaint.requestNumber || complaint.id}` 
      : `✏️ تم تحديث شكوى - ${complaint.requestNumber || complaint.id}`;

    const content = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          ${type === 'new' ? 'تمت إضافة شكوى جديدة' : 'تم تحديث الشكوى'}
        </h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">رقم التذكرة:</td>
              <td style="padding: 8px 0;">${complaint.requestNumber || complaint.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">اسم العميل:</td>
              <td style="padding: 8px 0;">${complaint.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">المشروع:</td>
              <td style="padding: 8px 0;">${complaint.project}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">رقم الوحدة:</td>
              <td style="padding: 8px 0;">${complaint.unitNumber || 'غير محدد'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">الحالة:</td>
              <td style="padding: 8px 0;"><span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${complaint.status}</span></td>
            </tr>
            ${type === 'update' ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">تم التحديث بواسطة:</td>
              <td style="padding: 8px 0;">${complaint.updatedBy}</td>
            </tr>
            ` : ''}
          </table>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-weight: bold; color: #374151;">وصف الشكوى:</p>
            <p style="margin: 5px 0 0 0; background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">${complaint.description}</p>
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
          هذا بريد تلقائي من نظام إدارة الشكاوى - الرجاء عدم الرد عليه
        </p>
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
    console.error('Error sending complaint email:', error);
    return { success: false, error };
  }
};

export const sendBookingEmail = async ({
  type,
  booking
}: {
  type: 'new' | 'update' | 'status_change';
  booking: {
    id: string;
    customerName: string;
    project: string;
    unitNumber: string;
    stage: string;
    bookingDate: string;
    deliveryDate?: string;
    updatedBy?: string;
    previousStage?: string;
  };
}) => {
  try {
    const subject = type === 'new' 
      ? `📅 حجز تسليم جديد - ${booking.customerName}` 
      : type === 'update'
      ? `✏️ تم تحديث حجز التسليم - ${booking.customerName}`
      : `🔄 تغيير حالة حجز التسليم - ${booking.customerName}`;

    const getStageColor = (stage: string) => {
      switch (stage) {
        case 'تم التسليم': return '#10b981';
        case 'جاهز للتسليم': return '#3b82f6';
        case 'قيد التجهيز': return '#f59e0b';
        case 'تم الحجز': return '#8b5cf6';
        default: return '#6b7280';
      }
    };

    const content = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          ${type === 'new' ? 'تم إنشاء حجز تسليم جديد' : 
            type === 'update' ? 'تم تحديث حجز التسليم' : 
            'تم تغيير حالة حجز التسليم'}
        </h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">رقم الحجز:</td>
              <td style="padding: 8px 0;">${booking.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">اسم العميل:</td>
              <td style="padding: 8px 0;">${booking.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">المشروع:</td>
              <td style="padding: 8px 0;">${booking.project}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">رقم الوحدة:</td>
              <td style="padding: 8px 0;">${booking.unitNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">تاريخ الحجز:</td>
              <td style="padding: 8px 0;">${booking.bookingDate}</td>
            </tr>
            ${booking.deliveryDate ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">تاريخ التسليم:</td>
              <td style="padding: 8px 0;">${booking.deliveryDate}</td>
            </tr>
            ` : ''}
            ${type === 'status_change' && booking.previousStage ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">الحالة السابقة:</td>
              <td style="padding: 8px 0;">
                <span style="background: ${getStageColor(booking.previousStage)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${booking.previousStage}
                </span>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">الحالة الحالية:</td>
              <td style="padding: 8px 0;">
                <span style="background: ${getStageColor(booking.stage)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${booking.stage}
                </span>
              </td>
            </tr>
            ${type !== 'new' && booking.updatedBy ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">تم التحديث بواسطة:</td>
              <td style="padding: 8px 0;">${booking.updatedBy}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
          هذا بريد تلقائي من نظام إدارة التسليم - الرجاء عدم الرد عليه
        </p>
      </div>
    `;

    const email = await resend.emails.send({
      from: 'نظام التسليم - الرمز <noreply@alramz.sa>',
      to: employeeEmails,
      subject,
      html: content,
    });

    return { success: true, data: email };
  } catch (error) {
    console.error('Error sending booking email:', error);
    return { success: false, error };
  }
};

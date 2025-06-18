
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'طريقة غير مسموح بها' });
  }

  try {
    const data = req.body;
    
    // تحقق من وجود البيانات المطلوبة
    if (!data.period) {
      return res.status(400).json({ error: 'الفترة مطلوبة' });
    }

    const result = await prisma.customerServiceData.create({
      data: {
        period: data.period,
        complaints: data.complaints || 0,
        contactRequests: data.contactRequests || 0,
        maintenanceRequests: data.maintenanceRequests || 0,
        inquiries: data.inquiries || 0,
        officeInterested: data.officeInterested || 0,
        projectsInterested: data.projectsInterested || 0,
        customersInterested: data.customersInterested || 0
      }
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('خطأ في حفظ البيانات:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ البيانات' });
  }
}

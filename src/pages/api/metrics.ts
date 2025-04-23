
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // تأكد من اتصال Prisma
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل الاتصال بقاعدة البيانات'
    });
  }

  if (req.method === 'GET') {
    try {
      const metrics = await prisma.metrics.findFirst({
        orderBy: {
          createdAt: 'desc'
        },
        where: {
          period: req.query.period as string
        }
      });
      
      return res.status(200).json({ 
        success: true, 
        metrics: metrics || null
      });
    } catch (error) {
      console.error('خطأ في استرجاع البيانات:', error);
      return res.status(500).json({ 
        success: false,
        error: 'فشل في استرجاع البيانات'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { period, metrics } = req.body;

      if (!period || !metrics) {
        return res.status(400).json({ 
          success: false,
          error: 'البيانات المطلوبة غير مكتملة' 
        });
      }

      const result = await prisma.metrics.upsert({
        where: {
          period: period
        },
        update: {
          data: JSON.stringify(metrics),
          updatedAt: new Date()
        },
        create: {
          period: period,
          data: JSON.stringify(metrics)
        }
      });

      return res.status(200).json({ 
        success: true, 
        data: result 
      });
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      return res.status(500).json({ 
        success: false,
        error: 'فشل في حفظ البيانات'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

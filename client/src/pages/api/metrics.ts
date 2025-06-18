
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // التحقق من الاتصال
    await prisma.$connect();
    
    if (req.method === 'GET') {
      const metrics = await prisma.metrics.findFirst({
        where: {
          period: req.query.period as string
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({ 
        success: true, 
        metrics: metrics || null
      });
    }

    if (req.method === 'POST') {
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
          data: JSON.stringify(metrics)
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
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ في معالجة الطلب'
    });
  } finally {
    await prisma.$disconnect();
  }
}

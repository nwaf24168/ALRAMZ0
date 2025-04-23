
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/db';
import express from 'express';
const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const metrics = await prisma.metrics.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.status(200).json({ 
      success: true, 
      metrics 
    });
  } catch (error) {
    console.error('خطأ في استرجاع البيانات:', error);
    return res.status(500).json({ 
      success: false,
      error: 'فشل في استرجاع البيانات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
});

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const { period, metrics } = req.body;

    if (!period || !metrics) {
      return res.status(400).json({ error: 'البيانات المطلوبة غير مكتملة' });
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
      error: 'فشل في حفظ البيانات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
});

export default router;

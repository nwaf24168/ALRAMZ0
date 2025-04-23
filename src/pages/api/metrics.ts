
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { period, metrics } = req.body;

    // حفظ البيانات في قاعدة البيانات
    const result = await prisma.metrics.upsert({
      where: {
        period: period
      },
      update: {
        data: metrics
      },
      create: {
        period: period,
        data: metrics
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error saving metrics:', error);
    res.status(500).json({ error: 'Failed to save metrics' });
  }
}

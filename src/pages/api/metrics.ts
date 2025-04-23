
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { period, metrics } = req.body;

    if (!period || !metrics) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // حفظ البيانات في قاعدة البيانات
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

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error saving metrics:', error);
    return res.status(500).json({ 
      error: 'Failed to save metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

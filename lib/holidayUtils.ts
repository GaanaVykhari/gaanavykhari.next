import { getDb } from '@/lib/mongo';
import { IHoliday } from '@/types';

// Utility function to check if a date falls within any holiday period
export async function isHoliday(date: Date): Promise<boolean> {
  try {
    const db = await getDb();
    const holiday = await db.collection<IHoliday>('holidays').findOne({
      fromDate: { $lte: date },
      toDate: { $gte: date },
    });
    return !!holiday;
  } catch (error) {
    console.error('Error checking if date is holiday:', error);
    return false;
  }
}

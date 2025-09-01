import { getDb } from '@/lib/mongo';
import { IHoliday } from '@/types';

// Cache for holidays to avoid repeated database queries
let holidaysCache: IHoliday[] | null = null;
let holidaysCacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Utility function to check if a date falls within any holiday period
export async function isHoliday(date: Date): Promise<boolean> {
  try {
    const holidays = await getHolidays();
    return holidays.some(
      holiday => holiday.fromDate <= date && holiday.toDate >= date
    );
  } catch {
    return false;
  }
}

// Get all holidays with caching
export async function getHolidays(): Promise<IHoliday[]> {
  const now = Date.now();

  // Return cached holidays if still valid
  if (holidaysCache && now < holidaysCacheExpiry) {
    return holidaysCache;
  }

  try {
    const db = await getDb();
    const holidays = await db
      .collection<IHoliday>('holidays')
      .find({})
      .sort({ fromDate: 1 })
      .toArray();

    // Update cache
    holidaysCache = holidays;
    holidaysCacheExpiry = now + CACHE_DURATION;

    return holidays;
  } catch {
    return holidaysCache || []; // Return cached data if available
  }
}

// Clear holidays cache (call this when holidays are updated)
export function clearHolidaysCache(): void {
  holidaysCache = null;
  holidaysCacheExpiry = 0;
}

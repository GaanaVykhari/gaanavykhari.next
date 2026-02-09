import { IStudent } from '@/types';
import { getHolidays } from './holidayUtils';

export interface ScheduleEntry {
  student: IStudent;
  time: string;
  status: 'scheduled' | 'attended' | 'canceled' | 'missed';
  sessionId?: string;
  isAdhoc?: boolean;
}

export interface UpcomingSession {
  student: IStudent;
  date: Date;
  time: string;
  daysFromNow: number;
  isAdhoc?: boolean;
}

/**
 * Calculate the next session date for a student based on their schedule and induction date
 */
export function getNextSessionDate(
  student: IStudent,
  fromDate: Date = new Date(),
  holidays: any[] = []
): Date | null {
  const { schedule, inductionDate } = student;
  const induction = new Date(inductionDate);
  const current = new Date(fromDate);

  // Start from the max of induction date or current date
  const startDate = new Date(Math.max(induction.getTime(), current.getTime()));

  let nextDate: Date | null = null;

  switch (schedule.frequency) {
    case 'daily':
      nextDate = addDays(startDate, 1);
      break;

    case 'weekly':
      nextDate = getNextWeeklySession(startDate, schedule.daysOfTheWeek);
      break;

    case 'fortnightly':
      nextDate = getNextFortnightlySession(
        startDate,
        schedule.daysOfTheWeek,
        induction
      );
      break;

    case 'monthly':
      nextDate = getNextMonthlySession(startDate, schedule.daysOfTheMonth);
      break;

    default:
      return null;
  }

  // If the next date falls on a holiday, find the next available date
  if (
    nextDate &&
    holidays.some(
      holiday => holiday.fromDate <= nextDate && holiday.toDate >= nextDate
    )
  ) {
    // Recursively find the next non-holiday date
    return getNextSessionDate(student, addDays(nextDate, 1), holidays);
  }

  return nextDate;
}

/**
 * Get upcoming sessions for all students
 */
export async function getUpcomingSessions(
  students: IStudent[],
  limit: number = 5
): Promise<UpcomingSession[]> {
  const upcomingSessions: UpcomingSession[] = [];
  const today = new Date();

  // Get holidays once for all students to avoid repeated database queries
  const holidays = await getHolidays();

  for (const student of students) {
    const nextSessionDate = getNextSessionDate(student, today, holidays);
    if (nextSessionDate) {
      const daysFromNow = Math.ceil(
        (nextSessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      upcomingSessions.push({
        student,
        date: nextSessionDate,
        time: student.schedule.time,
        daysFromNow,
      });
    }
  }

  // Sort by date and return the limit
  return upcomingSessions
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
}

/**
 * Get all sessions for today across all students
 */
export async function getTodaysSchedule(
  students: IStudent[]
): Promise<ScheduleEntry[]> {
  const today = new Date();
  const todaysSchedule: ScheduleEntry[] = [];

  // Get holidays once for all students to avoid repeated database queries
  const holidays = await getHolidays();

  for (const student of students) {
    if (isSessionScheduledForDate(student, today, holidays)) {
      todaysSchedule.push({
        student,
        time: student.schedule.time,
        status: 'scheduled', // Default status, would be fetched from sessions collection
      });
    }
  }

  // Sort by time
  return todaysSchedule.sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Check if a student has a session scheduled for a specific date
 */
export function isSessionScheduledForDate(
  student: IStudent,
  date: Date,
  holidays: any[] = []
): boolean {
  const { schedule, inductionDate } = student;
  const induction = new Date(inductionDate);

  // If the date is before induction, no session
  if (date < induction) {
    return false;
  }

  // Check if it's a holiday (using cached holidays)
  if (
    holidays.some(holiday => holiday.fromDate <= date && holiday.toDate >= date)
  ) {
    return false;
  }

  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayOfMonth = date.getDate();

  switch (schedule.frequency) {
    case 'daily':
      return true;

    case 'weekly':
      return schedule.daysOfTheWeek.includes(dayOfWeek);

    case 'fortnightly':
      if (!schedule.daysOfTheWeek.includes(dayOfWeek)) {
        return false;
      }
      // Check if it's the correct fortnight
      const weeksSinceInduction = Math.floor(
        (date.getTime() - induction.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      return weeksSinceInduction % 2 === 0;

    case 'monthly':
      return schedule.daysOfTheMonth.includes(dayOfMonth);

    default:
      return false;
  }
}

// Helper functions
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getNextWeeklySession(
  fromDate: Date,
  daysOfWeek: number[]
): Date | null {
  if (daysOfWeek.length === 0) {
    return null;
  }

  const today = fromDate.getDay();
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);

  // Find the next day in this week
  for (const day of sortedDays) {
    if (day > today) {
      const nextDate = new Date(fromDate);
      nextDate.setDate(nextDate.getDate() + (day - today));
      return nextDate;
    }
  }

  // If no day found in current week, get the first day of next week
  const firstDayNextWeek = sortedDays[0];
  if (firstDayNextWeek === undefined) {
    return null;
  }
  const daysUntilNextWeek = 7 - today + firstDayNextWeek;
  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + daysUntilNextWeek);
  return nextDate;
}

function getNextFortnightlySession(
  fromDate: Date,
  daysOfWeek: number[],
  inductionDate: Date
): Date | null {
  if (daysOfWeek.length === 0) {
    return null;
  }

  const weeksSinceInduction = Math.floor(
    (fromDate.getTime() - inductionDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const isCurrentWeekScheduled = weeksSinceInduction % 2 === 0;

  if (isCurrentWeekScheduled) {
    // Try to find a session in the current week
    const nextInCurrentWeek = getNextWeeklySession(fromDate, daysOfWeek);
    if (nextInCurrentWeek && isSameWeek(nextInCurrentWeek, fromDate)) {
      return nextInCurrentWeek;
    }
  }

  // Find the next session in the next scheduled fortnight
  const nextScheduledWeek = new Date(fromDate);
  nextScheduledWeek.setDate(
    nextScheduledWeek.getDate() + (isCurrentWeekScheduled ? 14 : 7)
  );

  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
  const firstDayOfWeek = sortedDays[0];
  if (firstDayOfWeek === undefined) {
    return null;
  }

  // Get to the start of the week and then to the first scheduled day
  const startOfWeek = new Date(nextScheduledWeek);
  startOfWeek.setDate(
    startOfWeek.getDate() - startOfWeek.getDay() + firstDayOfWeek
  );

  return startOfWeek;
}

function getNextMonthlySession(
  fromDate: Date,
  daysOfMonth: number[]
): Date | null {
  if (daysOfMonth.length === 0) {
    return null;
  }

  const currentDay = fromDate.getDate();
  const sortedDays = [...daysOfMonth].sort((a, b) => a - b);

  // Find the next day in this month
  for (const day of sortedDays) {
    if (day > currentDay) {
      const nextDate = new Date(fromDate);
      nextDate.setDate(day);
      return nextDate;
    }
  }

  // If no day found in current month, get the first day of next month
  const firstDayNextMonth = sortedDays[0];
  if (firstDayNextMonth === undefined) {
    return null;
  }
  const nextDate = new Date(fromDate);
  nextDate.setMonth(nextDate.getMonth() + 1, firstDayNextMonth);
  return nextDate;
}

function isSameWeek(date1: Date, date2: Date): boolean {
  const startOfWeek1 = new Date(date1);
  startOfWeek1.setDate(startOfWeek1.getDate() - startOfWeek1.getDay());

  const startOfWeek2 = new Date(date2);
  startOfWeek2.setDate(startOfWeek2.getDate() - startOfWeek2.getDay());

  return startOfWeek1.getTime() === startOfWeek2.getTime();
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    if (!hours || !minutes) {
      return time;
    }
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return time;
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get relative date string (e.g., "Today", "Tomorrow", "In 3 days")
 */
export function getRelativeDateString(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffInDays = Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return 'Today';
  }
  if (diffInDays === 1) {
    return 'Tomorrow';
  }
  if (diffInDays === -1) {
    return 'Yesterday';
  }
  if (diffInDays > 0) {
    return `In ${diffInDays} days`;
  }
  return `${Math.abs(diffInDays)} days ago`;
}

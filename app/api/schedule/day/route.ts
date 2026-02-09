import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { isSessionScheduledForDate } from '@/lib/scheduleServerUtils';
import { getHolidays, isHoliday } from '@/lib/holidayUtils';
import { IStudent } from '@/types';

interface DayEntry {
  studentName: string;
  studentId: string;
  time: string;
  source: 'schedule' | 'adhoc';
  status?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { ok: false, message: 'date query parameter is required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(dateParam + 'T00:00:00');
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { ok: false, message: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check if the date is a holiday
    const holidayOnDate = await isHoliday(targetDate);

    const db = await getDb();
    const students = await db
      .collection<IStudent>('students')
      .find({})
      .toArray();
    const holidays = await getHolidays();

    const entries: DayEntry[] = [];
    const seen = new Set<string>(); // track "studentId-time" to deduplicate

    // 1. Regular schedule entries
    for (const student of students) {
      if (isSessionScheduledForDate(student, targetDate, holidays)) {
        const key = `${String(student._id)}-${student.schedule.time}`;
        seen.add(key);
        entries.push({
          studentName: student.name,
          studentId: String(student._id),
          time: student.schedule.time,
          source: 'schedule',
        });
      }
    }

    // 2. DB sessions for that date (adhoc + recorded)
    const dayStart = new Date(dateParam + 'T00:00:00');
    const dayEnd = new Date(dateParam + 'T23:59:59');

    const dbSessions = await db
      .collection('sessions')
      .aggregate([
        {
          $match: {
            date: { $gte: dayStart, $lte: dayEnd },
            status: { $ne: 'canceled' },
          },
        },
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'studentData',
          },
        },
        { $unwind: { path: '$studentData', preserveNullAndEmptyArrays: true } },
      ])
      .toArray();

    for (const sess of dbSessions) {
      const studentId = String(sess.student);
      const time = sess.time || '';
      const key = `${studentId}-${time}`;
      if (!seen.has(key)) {
        seen.add(key);
        entries.push({
          studentName: sess.studentData?.name || 'Unknown',
          studentId,
          time,
          source: 'adhoc',
          status: sess.status,
        });
      }
    }

    // Sort by time
    entries.sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      ok: true,
      data: {
        entries,
        isHoliday: holidayOnDate,
      },
      message: `Schedule for ${dateParam} fetched successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || 'Failed to fetch day schedule',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { IHoliday, IStudent, ISession } from '@/types';
import { clearHolidaysCache } from '@/lib/holidayUtils';
import { isSessionScheduledForDate } from '@/lib/scheduleServerUtils';

export async function GET() {
  try {
    const db = await getDb();
    const holidays = await db
      .collection<IHoliday>('holidays')
      .find({})
      .sort({ fromDate: 1 })
      .toArray();

    return NextResponse.json({
      ok: true,
      data: holidays,
      message: 'Holidays retrieved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to fetch holidays',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromDate, toDate, description } = body;

    // Validate input
    if (!fromDate || !toDate) {
      return NextResponse.json(
        {
          ok: false,
          message: 'fromDate and toDate are required',
        },
        { status: 400 }
      );
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Validate dates
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Invalid date format',
        },
        { status: 400 }
      );
    }

    // Ensure fromDate is before or equal to toDate
    if (from > to) {
      return NextResponse.json(
        {
          ok: false,
          message: 'fromDate must be before or equal to toDate',
        },
        { status: 400 }
      );
    }

    // Ensure dates are in the future
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (from < now) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Cannot create holidays for past dates',
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check for overlapping holidays
    const overlappingHoliday = await db
      .collection<IHoliday>('holidays')
      .findOne({
        $or: [
          {
            fromDate: { $lte: to },
            toDate: { $gte: from },
          },
        ],
      });

    if (overlappingHoliday) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Holiday period overlaps with existing holiday',
        },
        { status: 400 }
      );
    }

    // Create holiday
    const holiday: Omit<IHoliday, '_id'> = {
      fromDate: from,
      toDate: to,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<IHoliday>('holidays').insertOne(holiday);

    // Cancel any sessions that fall within the holiday period
    const affectedStudents = await cancelSessionsInHolidayPeriod(
      from,
      to,
      description
    );

    // Clear holidays cache since we added a new holiday
    clearHolidaysCache();

    return NextResponse.json({
      ok: true,
      data: {
        ...holiday,
        _id: result.insertedId,
        affectedStudents,
      },
      message: 'Holiday created successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to create holiday',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

interface AffectedStudent {
  name: string;
  phone: string;
  dates: string[];
}

async function cancelSessionsInHolidayPeriod(
  fromDate: Date,
  toDate: Date,
  description: string
): Promise<AffectedStudent[]> {
  try {
    const db = await getDb();
    const now = new Date();

    // 1. Cancel existing DB sessions in the date range
    const existingSessions = await db
      .collection<ISession>('sessions')
      .find({
        date: { $gte: fromDate, $lte: toDate },
        status: { $ne: 'canceled' },
      })
      .toArray();

    if (existingSessions.length > 0) {
      await db.collection('sessions').updateMany(
        {
          date: { $gte: fromDate, $lte: toDate },
          status: { $ne: 'canceled' },
        },
        {
          $set: { status: 'canceled', updatedAt: now },
        }
      );
    }

    // Track affected students: studentId -> { name, phone, dates[] }
    const affectedMap = new Map<
      string,
      { name: string; phone: string; dates: Set<string> }
    >();

    // Record students from existing canceled sessions
    if (existingSessions.length > 0) {
      const studentIds = [...new Set(existingSessions.map(s => s.student))];
      const { ObjectId } = await import('mongodb');
      const students = await db
        .collection<IStudent>('students')
        .find({
          _id: {
            $in: studentIds.map(id => new ObjectId(id)),
          } as any,
        })
        .toArray();

      const studentMap = new Map(students.map(s => [s._id!.toString(), s]));

      for (const session of existingSessions) {
        const student = studentMap.get(session.student);
        if (!student) {
          continue;
        }
        const id = student._id!.toString();
        if (!affectedMap.has(id)) {
          affectedMap.set(id, {
            name: student.name,
            phone: student.phone,
            dates: new Set(),
          });
        }
        affectedMap
          .get(id)!
          .dates.add(new Date(session.date).toISOString().split('T')[0]!);
      }
    }

    // 2. Create canceled session records for schedule-computed sessions
    const allStudents = await db
      .collection<IStudent>('students')
      .find({})
      .toArray();

    // Iterate each date in the holiday range
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const dateStr = currentDate.toISOString().split('T')[0]!;

      for (const student of allStudents) {
        const studentId = student._id!.toString();

        // Pass empty holidays array so the holiday check doesn't interfere
        if (isSessionScheduledForDate(student, currentDate, [])) {
          // Check if a DB session already exists for this student+date
          const dayStart = new Date(currentDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(currentDate);
          dayEnd.setHours(23, 59, 59, 999);

          const existingSession = await db
            .collection<ISession>('sessions')
            .findOne({
              student: studentId,
              date: { $gte: dayStart, $lte: dayEnd },
            });

          if (!existingSession) {
            // Create a canceled session record
            const sessionDate = new Date(currentDate);
            sessionDate.setHours(0, 0, 0, 0);

            await db.collection<Omit<ISession, '_id'>>('sessions').insertOne({
              student: studentId,
              date: sessionDate,
              time: student.schedule.time,
              status: 'canceled',
              notes: description || 'Holiday',
              createdAt: now,
              updatedAt: now,
            });
          }

          // Track this student as affected
          if (!affectedMap.has(studentId)) {
            affectedMap.set(studentId, {
              name: student.name,
              phone: student.phone,
              dates: new Set(),
            });
          }
          affectedMap.get(studentId)!.dates.add(dateStr);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Convert map to array
    return Array.from(affectedMap.values()).map(entry => ({
      name: entry.name,
      phone: entry.phone,
      dates: Array.from(entry.dates).sort(),
    }));
  } catch {
    return [];
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { IHoliday } from '@/types';
import { clearHolidaysCache } from '@/lib/holidayUtils';

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
    await cancelSessionsInHolidayPeriod(from, to);

    // Clear holidays cache since we added a new holiday
    clearHolidaysCache();

    return NextResponse.json({
      ok: true,
      data: { ...holiday, _id: result.insertedId },
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

async function cancelSessionsInHolidayPeriod(fromDate: Date, toDate: Date) {
  try {
    const db = await getDb();

    // Find all sessions that fall within the holiday period and are not already canceled
    const sessionsToCancel = await db
      .collection('sessions')
      .find({
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
        status: { $ne: 'canceled' },
      })
      .toArray();

    if (sessionsToCancel.length > 0) {
      // Update all sessions to canceled status
      await db.collection('sessions').updateMany(
        {
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
          status: { $ne: 'canceled' },
        },
        {
          $set: {
            status: 'canceled',
            updatedAt: new Date(),
          },
        }
      );

      // Log session cancellation for audit purposes
    }
  } catch {
    // Silently handle error - could be logged to error reporting service in production
  }
}

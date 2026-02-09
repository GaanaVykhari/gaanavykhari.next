import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { getTodaysSchedule, ScheduleEntry } from '@/lib/scheduleServerUtils';
import { IStudent } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const students = await db
      .collection<IStudent>('students')
      .find({})
      .toArray();

    const todaysSchedule = await getTodaysSchedule(students);

    // Build a set of studentId-time combos from the regular schedule
    const seen = new Set(
      todaysSchedule.map(e => `${String(e.student._id)}-${e.time}`)
    );

    // Fetch adhoc DB sessions for today that aren't already covered
    const today = new Date();
    const dayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const dayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    const dbSessions = await db
      .collection('sessions')
      .aggregate([
        {
          $match: {
            date: { $gte: dayStart, $lte: dayEnd },
            status: 'scheduled',
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
        {
          $unwind: {
            path: '$studentData',
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();

    for (const sess of dbSessions) {
      const studentId = String(sess.student);
      const time = sess.time || '';
      const key = `${studentId}-${time}`;
      if (!seen.has(key) && sess.studentData) {
        seen.add(key);
        todaysSchedule.push({
          student: sess.studentData as IStudent,
          time,
          status: 'scheduled',
          sessionId: String(sess._id),
          isAdhoc: true,
        } as ScheduleEntry);
      }
    }

    // Re-sort by time after merging
    todaysSchedule.sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      ok: true,
      data: todaysSchedule,
      message: "Today's schedule fetched successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Failed to fetch today's schedule",
      },
      { status: 500 }
    );
  }
}

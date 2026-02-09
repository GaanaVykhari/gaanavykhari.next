import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import {
  getUpcomingSessions,
  UpcomingSession,
} from '@/lib/scheduleServerUtils';
import { IStudent } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const db = await getDb();
    const students = await db
      .collection<IStudent>('students')
      .find({})
      .toArray();

    const upcomingSessions = await getUpcomingSessions(students, limit);

    // Build a set to deduplicate: studentId-dateStr
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const seen = new Set(
      upcomingSessions.map(s => {
        const d = new Date(s.date);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return `${String(s.student._id)}-${dateStr}`;
      })
    );

    // Fetch future adhoc DB sessions with status = 'scheduled'
    const dbSessions = await db
      .collection('sessions')
      .aggregate([
        {
          $match: {
            date: { $gt: today },
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
        { $sort: { date: 1 } },
      ])
      .toArray();

    for (const sess of dbSessions) {
      const studentId = String(sess.student);
      const d = new Date(sess.date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const key = `${studentId}-${dateStr}`;

      if (!seen.has(key) && sess.studentData) {
        seen.add(key);
        const daysFromNow = Math.ceil(
          (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        upcomingSessions.push({
          student: sess.studentData as IStudent,
          date: d,
          time: sess.time || '',
          daysFromNow,
          isAdhoc: true,
        } as UpcomingSession);
      }
    }

    // Re-sort by date and apply limit
    upcomingSessions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const limited = upcomingSessions.slice(0, limit);

    return NextResponse.json({
      ok: true,
      data: limited,
      message: 'Upcoming sessions fetched successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || 'Failed to fetch upcoming sessions',
      },
      { status: 500 }
    );
  }
}

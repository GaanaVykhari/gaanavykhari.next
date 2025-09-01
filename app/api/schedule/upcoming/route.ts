import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { getUpcomingSessions } from '@/lib/scheduleServerUtils';
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

    return NextResponse.json({
      ok: true,
      data: upcomingSessions,
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

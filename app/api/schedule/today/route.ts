import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { getTodaysSchedule } from '@/lib/scheduleServerUtils';
import { IStudent } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    const students = await db
      .collection<IStudent>('students')
      .find({})
      .toArray();

    const todaysSchedule = await getTodaysSchedule(students);

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

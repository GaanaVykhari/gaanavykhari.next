import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/mongo';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');

    const db = await getDb();
    const sessionsCollection = db.collection('sessions');

    // Build query
    const query: any = {};
    if (studentId) query.student = studentId;
    if (status) query.status = status;

    // Get sessions with pagination
    const skip = (page - 1) * limit;
    const sessions = await sessionsCollection
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'student',
          },
        },
        { $unwind: '$student' },
        { $sort: { date: -1 } },
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();

    // Get total count
    const total = await sessionsCollection.countDocuments(query);

    return NextResponse.json({
      ok: true,
      data: {
        sessions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { studentId, date, time, notes } = body;

    if (!studentId || !date || !time) {
      return NextResponse.json(
        { ok: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const sessionsCollection = db.collection('sessions');

    const newSession = {
      student: studentId,
      date: new Date(date),
      time,
      status: 'scheduled',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await sessionsCollection.insertOne(newSession);

    // Get the created session with student details
    const createdSession = await sessionsCollection
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'student',
          },
        },
        { $unwind: '$student' },
      ])
      .toArray();

    return NextResponse.json({
      ok: true,
      data: createdSession[0],
      message: 'Session created successfully',
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to create session' },
      { status: 500 }
    );
  }
}

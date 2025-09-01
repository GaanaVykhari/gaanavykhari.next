import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = await getDb();
    const sessionsCollection = db.collection('sessions');

    const sessionData = await sessionsCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
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

    if (sessionData.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: sessionData[0],
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const db = await getDb();
    const sessionsCollection = db.collection('sessions');

    const updateData = {
      student: studentId,
      date: new Date(date),
      time,
      notes: notes || '',
      updatedAt: new Date(),
    };

    const result = await sessionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Get the updated session with student details
    const updatedSession = await sessionsCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
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
      data: updatedSession[0],
      message: 'Session updated successfully',
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to update session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { ok: false, message: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['scheduled', 'attended', 'canceled', 'missed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const db = await getDb();
    const sessionsCollection = db.collection('sessions');

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // If marking as attended, set the attendance date
    if (status === 'attended') {
      updateData.attendedAt = new Date();
    }

    const result = await sessionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Session status updated successfully',
    });
  } catch (error) {
    console.error('Error updating session status:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to update session status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = await getDb();
    const sessionsCollection = db.collection('sessions');

    const result = await sessionsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to delete session' },
      { status: 500 }
    );
  }
}

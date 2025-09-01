import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('students');

    const student = await collection.findOne(
      { _id: new ObjectId(resolvedParams.id) },
      {
        projection: {
          name: 1,
          email: 1,
          phone: 1,
          fees: 1,
          schedule: 1,
          inductionDate: 1,
          lastClassDate: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    );

    if (!student) {
      return NextResponse.json(
        { ok: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: student,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message || 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('students');

    const result = await collection.updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Student updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message || 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('students');

    const result = await collection.deleteOne({
      _id: new ObjectId(resolvedParams.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Student deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message || 'Failed to delete student' },
      { status: 500 }
    );
  }
}

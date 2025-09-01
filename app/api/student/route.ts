import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { ok: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('students');

    // Check for duplicate email
    const existingStudent = await collection.findOne({ email: body.email });
    if (existingStudent) {
      return NextResponse.json(
        { ok: false, message: 'Student with this email already exists' },
        { status: 409 }
      );
    }

    // Add timestamps
    const studentData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(studentData);

    return NextResponse.json({
      ok: true,
      data: { ...studentData, _id: result.insertedId },
      message: 'Student added successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message || 'Failed to add student' },
      { status: 500 }
    );
  }
}

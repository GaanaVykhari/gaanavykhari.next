import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDb();
    const collection = db.collection('students');

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
    console.error('Error adding student:', error);
    return NextResponse.json(
      { ok: false, message: error.message || 'Failed to add student' },
      { status: 500 }
    );
  }
}

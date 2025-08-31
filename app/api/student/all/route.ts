import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  try {
    const db = await getDb();
    const collection = db.collection('students');

    // Build query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      };
    }

    // Get total count
    const total = await collection.countDocuments(query);

    // Pagination
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Get students with pagination
    const students = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      ok: true,
      data: {
        rows: students,
        total,
        hasMore: skip + pageSize < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { ok: false, message: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

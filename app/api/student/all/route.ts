import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  try {
    const db = await getDb();
    const collection = db.collection('students');

    // Build optimized query
    let query = {};
    if (search) {
      // Use text search if available, otherwise fall back to regex
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );
      query = {
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      };
    }

    // Pagination
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Execute both queries in parallel for better performance
    const [students, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .project({
          name: 1,
          email: 1,
          phone: 1,
          fees: 1,
          schedule: 1,
          inductionDate: 1,
          lastClassDate: 1,
          createdAt: 1,
          updatedAt: 1,
        })
        .toArray(),
      collection.countDocuments(query),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        rows: students,
        total,
        hasMore: skip + pageSize < total,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

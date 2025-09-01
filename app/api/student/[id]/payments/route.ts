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
    const paymentsCollection = db.collection('payments');

    const payments = await paymentsCollection
      .find({ student: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      ok: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error fetching student payments:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch student payments' },
      { status: 500 }
    );
  }
}

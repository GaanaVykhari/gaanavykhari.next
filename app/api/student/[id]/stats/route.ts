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
    const paymentsCollection = db.collection('payments');

    // Get session statistics
    const sessionStats = await sessionsCollection
      .aggregate([
        { $match: { student: new ObjectId(id) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Get payment statistics
    const paymentStats = await paymentsCollection
      .aggregate([
        { $match: { student: new ObjectId(id) } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Calculate attendance rate
    const totalSessions = sessionStats.reduce(
      (sum, stat) => sum + stat.count,
      0
    );
    const attendedSessions =
      sessionStats.find(stat => stat._id === 'attended')?.count || 0;
    const attendanceRate =
      totalSessions > 0
        ? Math.round((attendedSessions / totalSessions) * 100)
        : 0;

    // Calculate payment totals
    const totalPaid =
      paymentStats.find(stat => stat._id === 'paid')?.total || 0;
    const pendingPayments =
      paymentStats.find(stat => stat._id === 'pending')?.total || 0;
    const overduePayments =
      paymentStats.find(stat => stat._id === 'overdue')?.total || 0;

    const stats = {
      totalSessions,
      attendedSessions,
      missedSessions:
        sessionStats.find(stat => stat._id === 'missed')?.count || 0,
      canceledSessions:
        sessionStats.find(stat => stat._id === 'canceled')?.count || 0,
      attendanceRate,
      totalPaid,
      pendingPayments,
      overduePayments,
    };

    return NextResponse.json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch student statistics' },
      { status: 500 }
    );
  }
}

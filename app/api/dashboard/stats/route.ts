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

    const db = await getDb();
    const studentsCollection = db.collection('students');
    const sessionsCollection = db.collection('sessions');
    const paymentsCollection = db.collection('payments');

    // Get current date for monthly calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get total students
    const totalStudents = await studentsCollection.countDocuments();

    // Get total sessions
    const totalSessions = await sessionsCollection.countDocuments();

    // Get attendance statistics
    const sessionStats = await sessionsCollection
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const attendedSessions =
      sessionStats.find(stat => stat._id === 'attended')?.count || 0;
    const totalCompletedSessions = sessionStats.reduce(
      (sum, stat) =>
        ['attended', 'missed', 'canceled'].includes(stat._id)
          ? sum + stat.count
          : sum,
      0
    );
    const attendanceRate =
      totalCompletedSessions > 0
        ? Math.round((attendedSessions / totalCompletedSessions) * 100)
        : 0;

    // Get payment statistics
    const paymentStats = await paymentsCollection
      .aggregate([
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const totalRevenue =
      paymentStats.find(stat => stat._id === 'paid')?.total || 0;
    const pendingPayments =
      paymentStats.find(stat => stat._id === 'pending')?.total || 0;
    const overduePayments =
      paymentStats.find(stat => stat._id === 'overdue')?.total || 0;

    // Get monthly revenue
    const monthlyRevenue = await paymentsCollection
      .aggregate([
        {
          $match: {
            status: 'paid',
            paymentDate: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ])
      .toArray();

    const monthlyRevenueAmount = monthlyRevenue[0]?.total || 0;

    // Get active students (students with sessions in the last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activeStudents = await sessionsCollection.distinct('student', {
      date: { $gte: thirtyDaysAgo },
    });

    const stats = {
      totalStudents,
      totalSessions,
      totalRevenue,
      monthlyRevenue: monthlyRevenueAmount,
      pendingPayments,
      overduePayments,
      attendanceRate,
      activeStudents: activeStudents.length,
    };

    return NextResponse.json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

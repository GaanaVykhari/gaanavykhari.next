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
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const db = await getDb();
    const paymentsCollection = db.collection('payments');

    // Build query
    const query: any = {};
    if (studentId) query.student = studentId;
    if (status && status !== 'all') query.status = status;

    // Get payments with pagination
    const skip = (page - 1) * limit;
    let aggregationPipeline: any[] = [
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
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    // Add search functionality
    if (search) {
      aggregationPipeline.unshift({
        $match: {
          ...query,
          $or: [
            { 'student.name': { $regex: search, $options: 'i' } },
            { 'student.email': { $regex: search, $options: 'i' } },
            { 'student.phone': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const payments = await paymentsCollection
      .aggregate(aggregationPipeline)
      .toArray();

    // Get total count
    const total = await paymentsCollection.countDocuments(query);

    return NextResponse.json({
      ok: true,
      data: {
        payments,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch payments' },
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
    const { studentId, amount, dueDate, notes } = body;

    if (!studentId || !amount || !dueDate) {
      return NextResponse.json(
        { ok: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const paymentsCollection = db.collection('payments');

    const newPayment = {
      student: studentId,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      status: 'pending',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await paymentsCollection.insertOne(newPayment);

    // Get the created payment with student details
    const createdPayment = await paymentsCollection
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
      data: createdPayment[0],
      message: 'Payment created successfully',
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

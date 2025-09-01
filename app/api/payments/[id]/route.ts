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

    const db = await getDb();
    const paymentsCollection = db.collection('payments');

    const { id } = await params;
    const payment = await paymentsCollection
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

    if (payment.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: payment[0],
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch payment' },
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

    const { id } = await params;
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

    const updateData = {
      student: studentId,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      notes: notes || '',
      updatedAt: new Date(),
    };

    const result = await paymentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get the updated payment with student details
    const updatedPayment = await paymentsCollection
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
      data: updatedPayment[0],
      message: 'Payment updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to update payment' },
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

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { ok: false, message: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['paid', 'pending', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const paymentsCollection = db.collection('payments');

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // If marking as paid, set the payment date
    if (status === 'paid') {
      updateData.paymentDate = new Date();
    }

    const result = await paymentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Payment status updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to update payment status' },
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
    const paymentsCollection = db.collection('payments');

    const result = await paymentsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Payment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}

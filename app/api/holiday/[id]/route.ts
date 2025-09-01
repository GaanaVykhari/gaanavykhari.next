import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Invalid holiday ID',
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('holidays').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Holiday not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Holiday deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to delete holiday',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

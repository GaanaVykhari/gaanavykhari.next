import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function GET() {
  try {
    // Test MongoDB connection
    const db = await getDb();
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      ok: true,
      mongodb: 'connected',
      collections: collections.map((c: any) => c.name),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // Health check failed - return error response without logging
    return NextResponse.json(
      {
        ok: false,
        mongodb: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

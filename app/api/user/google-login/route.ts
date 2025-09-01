import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Add timeout for MongoDB connection
    const db = await Promise.race([
      getDb(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000)
      ),
    ]);

    const user = await db
      .collection('users')
      .findOne({ username: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate a simple token (in production, you'd want to use a proper JWT library)
    const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      ok: true,
      message: 'Login successful',
      token,
      data: {
        name: user.name,
        username: user.username,
        _id: user._id,
      },
    });
  } catch (error: any) {
    // Return a more specific error message for MongoDB connection issues
    if (
      error.message.includes('MongoDB') ||
      error.message.includes('SSL') ||
      error.message.includes('TLS')
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Database connection error. Please try again later.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

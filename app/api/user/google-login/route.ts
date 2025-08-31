import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
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
    console.error('Google login error:', error);
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

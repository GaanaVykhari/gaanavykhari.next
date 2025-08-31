import { NextResponse } from 'next/server';

export async function POST() {
  // Login is handled by NextAuth, this endpoint is not needed
  return NextResponse.json(
    {
      ok: false,
      message: 'Login is handled by NextAuth',
    },
    { status: 501 }
  );
}

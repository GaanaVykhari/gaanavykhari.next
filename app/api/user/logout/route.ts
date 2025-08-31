import { NextResponse } from 'next/server';

export async function POST() {
  // For NextAuth, we don't need to make any backend calls
  // The session will be cleared when the user signs out
  const res = NextResponse.json({ ok: true });

  // Clear any custom cookies if they exist
  res.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return res;
}

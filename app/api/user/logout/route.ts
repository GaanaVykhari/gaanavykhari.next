import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/apiClient';
import { buildAuthHeaders } from '@/lib/auth';

export async function DELETE() {
  try {
    await proxyRequest('/user/logout', {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    });
  } catch {
    // ignore backend error on logout
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return res;
}

import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/apiClient';

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const data = await proxyRequest('/user/login', { method: 'POST', body });
    const res = NextResponse.json(data);
    if (data?.token) {
      res.cookies.set('token', data.token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 401 }
    );
  }
}

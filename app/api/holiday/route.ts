import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/apiClient';
import { getAuthHeadersAsync } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const data = await proxyRequest('/holiday', {
      method: 'POST',
      headers: await getAuthHeadersAsync(),
      body,
    });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}

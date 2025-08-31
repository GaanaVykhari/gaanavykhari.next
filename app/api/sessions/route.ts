import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/apiClient';
import { getAuthHeadersAsync } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const date = searchParams.get('date') || '';
  const qs = new URLSearchParams({
    ...(status && { status }),
    ...(date && { date }),
  }).toString();
  const path = `/sessions${qs ? `?${qs}` : ''}`;
  try {
    const data = await proxyRequest(path, {
      headers: await getAuthHeadersAsync(),
    });
    return NextResponse.json(data?.data ?? data);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}

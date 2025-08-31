import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/apiClient';
import { getAuthHeadersAsync } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const page = searchParams.get('page') || '';
  const qs = new URLSearchParams({
    ...(status && { status }),
    ...(page && { page }),
  }).toString();
  const path = `/payments${qs ? `?${qs}` : ''}`;
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

export async function POST(request: Request) {
  const body = await request.json();
  const action = body?.action;
  try {
    if (action === 'remind') {
      const data = await proxyRequest('/payments/remind', {
        method: 'POST',
        headers: await getAuthHeadersAsync(),
        body,
      });
      return NextResponse.json(data);
    }
    if (action === 'mark-as-paid') {
      const data = await proxyRequest('/payments/mark-as-paid', {
        method: 'POST',
        headers: await getAuthHeadersAsync(),
        body,
      });
      return NextResponse.json(data);
    }
    return NextResponse.json(
      { ok: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}

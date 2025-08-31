import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/apiClient';
import { getAuthHeadersAsync } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '';
  const search = searchParams.get('search') || '';
  const qs = new URLSearchParams({
    ...(page && { page }),
    ...(search && { search }),
  }).toString();
  const path = `/student/all${qs ? `?${qs}` : ''}`;
  try {
    const data = await proxyRequest(path, {
      headers: await getAuthHeadersAsync(),
    });
    if (data instanceof Response) return data;
    return NextResponse.json(data?.data ?? data);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}

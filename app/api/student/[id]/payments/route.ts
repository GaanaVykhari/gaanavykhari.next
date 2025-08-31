import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/apiClient';
import { getAuthHeadersAsync } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '';
  const qs = new URLSearchParams({ ...(page && { page }) }).toString();
  const path = `/student/${resolvedParams.id}/payments${qs ? `?${qs}` : ''}`;
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

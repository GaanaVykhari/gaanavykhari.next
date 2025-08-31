import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/apiClient';
import { getAuthHeadersAsync } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  const body = await request.json();
  const resolvedParams = await params;
  try {
    const data = await proxyRequest(
      `/student/${resolvedParams.id}/session/${resolvedParams.sessionId}`,
      {
        method: 'PATCH',
        headers: await getAuthHeadersAsync(),
        body,
      }
    );
    return NextResponse.json(data?.data ?? data);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  const resolvedParams = await params;
  try {
    const data = await proxyRequest(
      `/student/${resolvedParams.id}/session/${resolvedParams.sessionId}`,
      {
        method: 'DELETE',
        headers: await getAuthHeadersAsync(),
      }
    );
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}

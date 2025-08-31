import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/apiClient';
import { getAuthHeadersAsync } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  const body = await request.json();
  const resolvedParams = await params;
  try {
    const data = await proxyRequest(
      `/student/${resolvedParams.id}/payment/${resolvedParams.paymentId}`,
      {
        method: 'PATCH',
        headers: await getAuthHeadersAsync(),
        body,
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

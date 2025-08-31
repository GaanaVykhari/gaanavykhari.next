import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Implement student payments
  return NextResponse.json({
    ok: true,
    data: {
      rows: [],
      total: 0,
      hasMore: false,
    },
    message: 'Student payments not yet implemented',
  });
}

export async function POST() {
  // TODO: Implement student payment creation
  return NextResponse.json(
    {
      ok: false,
      message: 'Student payments not yet implemented',
    },
    { status: 501 }
  );
}

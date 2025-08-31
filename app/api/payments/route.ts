import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Implement payments management
  return NextResponse.json({
    ok: true,
    data: {
      rows: [],
      total: 0,
      hasMore: false,
    },
    message: 'Payments management not yet implemented',
  });
}

export async function POST() {
  // TODO: Implement payment creation
  return NextResponse.json(
    {
      ok: false,
      message: 'Payments management not yet implemented',
    },
    { status: 501 }
  );
}

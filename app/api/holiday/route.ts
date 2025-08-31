import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Implement holiday management
  return NextResponse.json({
    ok: true,
    data: [],
    message: 'Holiday management not yet implemented',
  });
}

export async function POST() {
  // TODO: Implement holiday creation
  return NextResponse.json(
    {
      ok: false,
      message: 'Holiday management not yet implemented',
    },
    { status: 501 }
  );
}

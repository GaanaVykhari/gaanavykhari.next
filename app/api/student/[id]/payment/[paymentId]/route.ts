import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Implement individual payment details
  return NextResponse.json(
    {
      ok: false,
      message: 'Individual payment details not yet implemented',
    },
    { status: 501 }
  );
}

export async function PATCH() {
  // TODO: Implement payment updates
  return NextResponse.json(
    {
      ok: false,
      message: 'Payment updates not yet implemented',
    },
    { status: 501 }
  );
}

export async function DELETE() {
  // TODO: Implement payment deletion
  return NextResponse.json(
    {
      ok: false,
      message: 'Payment deletion not yet implemented',
    },
    { status: 501 }
  );
}

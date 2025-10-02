import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Example: validate user
  return NextResponse.json({ success: true, user: body.username ?? "guest" });
}


import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json({ stats: 'Metrics stats endpoint' });
}

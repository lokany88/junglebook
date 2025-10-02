import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, context: any) {
  const { id } = context.params;
  return NextResponse.json({ metricId: id });
}


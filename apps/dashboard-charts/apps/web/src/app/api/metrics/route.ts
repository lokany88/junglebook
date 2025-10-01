import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

type MetricRow = {
  id: number;
  label: string;
  value: number;
  created_at: string;
};

// GET /api/metrics  -> list metrics (optional ?limit=50)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? 50);
    const res = await client.execute(
      `SELECT * FROM metrics ORDER BY created_at DESC LIMIT ${Number.isFinite(limit) ? limit : 50}`
    );
    return NextResponse.json({ rows: res.rows as MetricRow[] });
  } catch (err: any) {
    console.error("metrics.GET error:", err);
    return NextResponse.json({ error: err.message || "Query failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { label, value } = await req.json();
    if (typeof label !== "string" || typeof value !== "number") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = await client.execute({
      sql: "INSERT INTO metrics (label, value) VALUES (?, ?)",
      args: [label, value],
    });

    return NextResponse.json({
      success: true,
      rowsAffected: result.rowsAffected,
      lastInsertRowid: result.lastInsertRowid
        ? result.lastInsertRowid.toString() // ✅ Fix BigInt issue
        : null,
    });
  } catch (err: any) {
    console.error("metrics.POST error:", err);
    return NextResponse.json({ error: err.message || "Insert failed" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// GET /api/metrics/stats
export async function GET() {
  try {
    const [{ rows: r1 }, { rows: r2 }, { rows: r3 }, { rows: r4 }] = await Promise.all([
      client.execute("SELECT COUNT(*) AS count FROM metrics"),
      client.execute("SELECT AVG(value) AS avg FROM metrics"),
      client.execute("SELECT MIN(value) AS min, MAX(value) AS max FROM metrics"),
      client.execute("SELECT COUNT(*) AS last24h FROM metrics WHERE datetime(created_at) >= datetime('now', '-24 hours')"),
    ]);

    return NextResponse.json({
      count: r1[0]?.count ?? 0,
      avg: r2[0]?.avg ?? null,
      min: r3[0]?.min ?? null,
      max: r3[0]?.max ?? null,
      last24h: r4[0]?.last24h ?? 0,
    });
  } catch (err: any) {
    console.error("metrics.stats.GET error:", err);
    return NextResponse.json({ error: err.message || "Stats failed" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function parseId(id: string) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw new Error("Invalid id");
  return n;
}

// GET /api/metrics/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params.id);
    const res = await client.execute({ sql: "SELECT * FROM metrics WHERE id = ?", args: [id] });
    if (res.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (err: any) {
    console.error("metrics.[id].GET error:", err);
    return NextResponse.json({ error: err.message || "Query failed" }, { status: 400 });
  }
}

// PUT /api/metrics/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params.id);
    const { label, value } = await req.json();

    if ((label !== undefined && typeof label !== "string") ||
        (value !== undefined && typeof value !== "number")) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const sets: string[] = [];
    const args: any[] = [];
    if (label !== undefined) { sets.push("label = ?"); args.push(label); }
    if (value !== undefined) { sets.push("value = ?"); args.push(value); }
    if (sets.length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

    args.push(id);
    const sql = `UPDATE metrics SET ${sets.join(", ")} WHERE id = ?`;
    const result = await client.execute({ sql, args });

    if (result.rowsAffected === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, rowsAffected: result.rowsAffected });
  } catch (err: any) {
    console.error("metrics.[id].PUT error:", err);
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 400 });
  }
}

// DELETE /api/metrics/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params.id);
    const res = await client.execute({ sql: "DELETE FROM metrics WHERE id = ?", args: [id] });
    if (res.rowsAffected === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, rowsAffected: res.rowsAffected });
  } catch (err: any) {
    console.error("metrics.[id].DELETE error:", err);
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 400 });
  }
}


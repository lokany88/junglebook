
from __future__ import annotations
from pathlib import Path
import json, subprocess

B_LOGIN = '''import { env } from 'cloudflare:env';

export async function POST(req: Request) {
  const data = await req.formData();
  const u = data.get('username');
  const p = data.get('password');
  if (u === env.ADMIN_USER && p === env.ADMIN_PASS) {
    const next = new URL(req.url).searchParams.get('next') || '/dashboard';
    return new Response(null, { status: 302, headers: {
      'Set-Cookie':'jb_auth=1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400',
      'Location': String(next)
    }});
  }
  return new Response('Invalid login', { status: 401 });
}
'''

B_MW = '''import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/dashboard'];

export function middleware(req: NextRequest) {
  const isProtected = PROTECTED.some(p => req.nextUrl.pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();
  const ok = req.cookies.get('jb_auth')?.value === '1';
  if (ok) return NextResponse.next();
  const url = new URL('/login', req.url);
  url.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}
'''

B_LOGIN_PAGE = ''''use client';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';
  return (
    <div style={{maxWidth:480, margin:'4rem auto', fontFamily:'system-ui'}}>
      <h1>Login</h1>
      <form method="POST" action={`/api/login?next=${encodeURIComponent(next)}`}>
        <label>Username<br/><input name="username" required /></label><br/><br/>
        <label>Password<br/><input name="password" type="password" required /></label><br/><br/>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
'''

B_METRICS_API = '''import { env } from 'cloudflare:env';

export async function GET() {
  const res = await env.DB
    .prepare("SELECT label, value, created_at FROM metrics ORDER BY created_at ASC LIMIT 100")
    .all();
  return Response.json(res.results ?? []);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { label, value } = body || {};
  if (!label || typeof value !== "number") {
    return Response.json({ error: "label and numeric value required" }, { status: 400 });
  }
  await env.DB.prepare("INSERT INTO metrics (label, value) VALUES (?1, ?2)")
    .bind(label, value).run();
  return Response.json({ ok: true });
}
'''

B_DASHBOARD = ''''use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Row = { label: string; value: number; created_at: string };

export default function Dashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { fetch('/api/metrics').then(r => r.json()).then(setRows); }, []);
  const labels = rows.map(r => new Date(r.created_at).toLocaleTimeString());
  const data = { labels, datasets: [{ label: 'Value', data: rows.map(r => r.value) }] };
  return (
    <div style={{maxWidth:900, margin:'2rem auto', fontFamily:'system-ui'}}>
      <h1>Dashboard</h1>
      <Line data={data} />
      <form onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const label = String(fd.get('label')||'Metric');
        const value = Number(fd.get('value')||0);
        await fetch('/api/metrics', { method:'POST', body: JSON.stringify({label, value}) });
        setRows(await (await fetch('/api/metrics')).json());
        (e.currentTarget as HTMLFormElement).reset();
      }} style={{marginTop:'2rem', display:'flex', gap:8}}>
        <input name="label" placeholder="label" defaultValue="Metric" />
        <input name="value" type="number" placeholder="value" />
        <button type="submit">Add point</button>
      </form>
    </div>
  );
}
'''

def _append_d1_block(wrangler_toml: Path, db_name: str):
  t = wrangler_toml.read_text() if wrangler_toml.exists() else ""
  if "d1_databases" in t and db_name in t:
    return
  block = f"""

[[d1_databases]]
binding = "DB"
database_name = "{db_name}"
database_id = "<REPLACE_WITH_ID>"
"""

  wrangler_toml.write_text(t + block)

def _ensure_scripts(pkg_json: Path):
  pkg = json.loads(pkg_json.read_text())
  pkg.setdefault("scripts", {})
  pkg["scripts"].setdefault("cf:build","opennextjs-cloudflare build")
  pkg["scripts"].setdefault("cf:preview","opennextjs-cloudflare preview")
  pkg["scripts"].setdefault("cf:deploy","opennextjs-cloudflare deploy")
  pkg.setdefault("engines", {"node": "^20"})
  pkg_json.write_text(json.dumps(pkg, indent=2))

def apply(app_slug: str, db_name: str):
  web = Path("apps")/app_slug/"apps"/"web"
  if not web.exists():
    raise SystemExit(f"Could not find {web}. Run inside your Jungle Book repo and use an existing Next.js app slug.")

  # write files
  (web/"src"/"app"/"api"/"login").mkdir(parents=True, exist_ok=True)
  (web/"src"/"app"/"api"/"login"/"route.ts").write_text(B_LOGIN)

  (web/"src"/"middleware.ts").write_text(B_MW)

  (web/"src"/"app"/"login").mkdir(parents=True, exist_ok=True)
  (web/"src"/"app"/"login"/"page.tsx").write_text(B_LOGIN_PAGE)

  (web/"src"/"app"/"api"/"metrics").mkdir(parents=True, exist_ok=True)
  (web/"src"/"app"/"api"/"metrics"/"route.ts").write_text(B_METRICS_API)

  (web/"src"/"app"/"dashboard").mkdir(parents=True, exist_ok=True)
  (web/"src"/"app"/"dashboard"/"page.tsx").write_text(B_DASHBOARD)

  # DB schema & seeds
  (web/"db").mkdir(exist_ok=True)
  (web/"db"/"schema.sql").write_text("CREATE TABLE IF NOT EXISTS metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, value INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')) );\n")
  (web/"db"/"seed.sql").write_text("INSERT INTO metrics (label,value) VALUES ('Signups',5),('Signups',9),('Signups',3),('Revenue',120),('Revenue',180),('Revenue',90);\n")

  # wrangler + package scripts
  _append_d1_block(web/"wrangler.toml", db_name)
  _ensure_scripts(web/"package.json")

  # install chart libs
  subprocess.run(["npm","i","chart.js","react-chartjs-2"], cwd=web, check=False)

  print("""[OK] Preset files added.

NEXT COMMANDS (copy–paste, once):
  cd {web}
  wrangler d1 create {db}
  wrangler d1 list      # copy the id for {db}, paste into wrangler.toml replacing <REPLACE_WITH_ID>
  wrangler d1 execute {db} --file=db/schema.sql
  wrangler d1 execute {db} --file=db/seed.sql
  wrangler secret put ADMIN_USER     # enter: admin (or your choice)
  wrangler secret put ADMIN_PASS     # enter: strong password
  npm run build && npm run cf:build && npm run cf:deploy

URLs:
  https://{app}.junglebook.workers.dev/login
  https://{app}.junglebook.workers.dev/dashboard
""".format(web=web, db=db_name, app=app_slug))

from __future__ import annotations

import typer
from pathlib import Path
from rich import print
import subprocess, datetime

from .selector import select_template
from .generators.serverless_edge import generate_t1
from .generators.django_postgres import generate_t2

app = typer.Typer(help="JungleBook CLI – build apps, apply presets, and manage.")

@app.command("preset")
def preset(
    kind: str = typer.Argument(..., help="next-login-charts"),
    app_slug: str = typer.Option(..., "--app", help="existing app slug (e.g. dashboard-charts)"),
    db: str = typer.Option("jb_dash", "--db", help="D1 database name"),
):
    if kind != "next-login-charts":
        raise typer.Exit(code=1)
    from .presets.next_login_charts import apply
    apply(app_slug, db)

@app.command("build")
def build(
    idea: str = typer.Argument(..., help="Free-form idea for the app"),
):
    """
    Build a new app from an idea. Auto-selects the right template,
    generates code + docs + governance pack (v2.0 compliant).
    """
    slug, template = select_template(idea)

    print(f"[bold green]Building {slug}[/bold green] with template: {template}")

    if template == "next_serverless_edge":
        generate_t1(slug, idea)
    elif template == "django_postgres":
        generate_t2(slug, idea)
    else:
        print(f"[red]Unknown template: {template}[/red]")
        raise typer.Exit(code=1)

    print(f"[cyan]✓ App created at apps/{slug}[/cyan]")
    print(f"[cyan]✓ Docs, governance, audit, and CI skeletons added[/cyan]")
    print("Next steps:")
    print(f"  cd apps/{slug}")
    print("  npm install && npm run build")
    print("  npm run cf:deploy   # deploy to Cloudflare")

k@app.command("audit")
def audit(
    app_slug: str = typer.Argument(..., help="App slug under apps/"),
):
    """
    Run the Million-Metric Audit baseline against an app.
    Always writes apps/<slug>/audit/AuditReport.md.
    """
    import datetime, subprocess

    # resolve paths
    base_dir = Path.cwd()
    app_root = base_dir / "apps" / app_slug
    audit_dir = app_root / "audit"
    audit_dir.mkdir(parents=True, exist_ok=True)  # <- ensures dir exists

    report_file = audit_dir / "AuditReport.md"
    now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    results = []

    # 1. Unit tests
    pkg_json = app_root / "package.json"
    if pkg_json.exists():
        try:
            subprocess.run(["npm", "test"], cwd=app_root, check=True)
            results.append("✓ Unit tests passed")
        except subprocess.CalledProcessError:
            results.append("✗ Unit tests failed")
    else:
        results.append("⚠ No package.json, skipping JS tests")

    # 2. Lighthouse placeholder
    results.append("TODO: Run Lighthouse CI (perf/SEO/a11y)")

    # 3. Accessibility placeholder
    results.append("TODO: Run axe-core")

    # 4. Policy checks placeholder
    controls_rego = audit_dir / "controls.rego"
    if controls_rego.exists():
        results.append("TODO: Run conftest on controls.rego")
    else:
        results.append("⚠ No controls.rego found")

    # 5. Dependency scan placeholder
    results.append("TODO: Run npm audit / pip-audit")

    # --- Always write report ---
    content = f"""# Audit Report for {app_slug}

Generated: {now}

Results:
{chr(10).join(f"- {r}" for r in results)}
"""
    report_file.write_text(content, encoding="utf-8")

    print(f"[bold green]✓ Audit complete[/bold green]. Report at {report_file}")


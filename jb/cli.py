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

@app.command("audit")
def audit(
    app_slug: str = typer.Argument(..., help="App slug under apps/"),
):
    """
    Run the Million-Metric Audit baseline against an app.
    Always writes an AuditReport.md, even if steps fail.
    """
    import subprocess, datetime

    base_dir = Path(__file__).resolve().parent.parent
    app_root = (base_dir / "apps" / app_slug).resolve()
    audit_dir = app_root / "audit"
    audit_dir.mkdir(parents=True, exist_ok=True)

    report_file = audit_dir / "AuditReport.md"
    now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    results = []
    exit_code = 0

    # 1. Unit tests
    if (app_root / "package.json").exists():
        try:
            subprocess.run(["npm", "test"], cwd=app_root, check=True)
            results.append("✓ Unit tests passed")
        except subprocess.CalledProcessError:
            results.append("✗ Unit tests failed")
            exit_code = 1
    else:
        results.append("⚠ No package.json found, skipping unit tests")

    # 2. Lighthouse (placeholder)
    results.append("TODO: Run Lighthouse CI (performance, SEO, best practices, accessibility)")

    # 3. Accessibility (axe) (placeholder)
    results.append("TODO: Run axe-core CLI against key pages")

    # 4. Policy checks (OPA/Rego) (placeholder)
    if (audit_dir / "controls.rego").exists():
        results.append("TODO: Run conftest test audit/controls.rego")
    else:
        results.append("⚠ No controls.rego found, skipping OPA policy checks")

    # 5. SBOM / Dependency scan (placeholder)
    if (app_root / "package.json").exists():
        results.append("TODO: Run npm audit")
    if (app_root / "requirements.txt").exists():
        results.append("TODO: Run pip-audit")

    # Always write a file
    content = f"""# Audit Report for {app_slug}

Generated: {now}

Results:
{chr(10).join(f"- {r}" for r in results)}
"""
    report_file.write_text(content)

    print(f"[bold green]✓ Audit complete[/bold green]. Report at {report_file}")

    # Fail CI if tests failed
    raise typer.Exit(code=exit_code)


import subprocess, datetime, json, shutil

@app.command("audit")
def audit(
    app_slug: str = typer.Argument(..., help="App slug under apps/"),
):
    """
    Run the Million-Metric Audit baseline against an app.
    Runs tests, Lighthouse, accessibility, policy, and dependency checks.
    Writes results to apps/<slug>/audit/AuditReport.md
    """
    app_root = Path("apps") / app_slug
    audit_dir = app_root / "audit"
    audit_dir.mkdir(parents=True, exist_ok=True)

    report_file = audit_dir / "AuditReport.md"
    now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    results = []

    # ---- 1. Unit Tests ----
    if (app_root / "package.json").exists():
        try:
            subprocess.run(["npm", "test", "--", "--watchAll=false"], cwd=app_root, check=True)
            results.append("## ✅ Unit Tests\n✓ Tests passed")
        except subprocess.CalledProcessError:
            results.append("## ❌ Unit Tests\n✗ Some tests failed")
    else:
        results.append("## ⚠ Unit Tests\nNo package.json found")

    # ---- 2. Lighthouse CI ----
    if shutil.which("npx"):
        try:
            lhci_out = subprocess.run(
                ["npx", "lhci", "autorun", "--upload.target=filesystem", "--upload.outputDir=./audit/lhci"],
                cwd=app_root,
                capture_output=True, text=True, check=True
            )
            results.append("## 🌐 Lighthouse\n" + lhci_out.stdout[-500:])  # last lines
        except subprocess.CalledProcessError:
            results.append("## ❌ Lighthouse\nRun failed")
    else:
        results.append("## ⚠ Lighthouse\nnpx not found")

    # ---- 3. Accessibility (axe-core) ----
    try:
        axe_out = subprocess.run(
            ["npx", "@axe-core/cli", "http://localhost:8788"],
            cwd=app_root,
            capture_output=True, text=True
        )
        if axe_out.returncode == 0:
            results.append("## ♿ Accessibility (axe-core)\n✓ No violations found")
        else:
            results.append("## ❌ Accessibility\n" + axe_out.stdout[:500])
    except Exception as e:
        results.append(f"## ⚠ Accessibility\nSkipped ({e})")

    # ---- 4. Governance Policies (OPA/Rego) ----
    if (audit_dir / "controls.rego").exists():
        try:
            subprocess.run(["conftest", "test", str(audit_dir / "controls.rego")], check=True)
            results.append("## 🛡️ Governance (OPA)\n✓ All policies passed")
        except subprocess.CalledProcessError:
            results.append("## ❌ Governance (OPA)\nPolicy violations found")
    else:
        results.append("## ⚠ Governance\nNo controls.rego found")

    # ---- 5. Dependency Audit ----
    dep_summary = []
    if (app_root / "package.json").exists():
        try:
            npm_out = subprocess.run(["npm", "audit", "--json"], cwd=app_root, capture_output=True, text=True)
            data = json.loads(npm_out.stdout)
            dep_summary.append(f"JS: {data.get('metadata', {}).get('vulnerabilities', {})}")
        except Exception:
            dep_summary.append("JS audit failed")

    try:
        pip_out = subprocess.run(["pip-audit", "-f", "json"], capture_output=True, text=True)
        if pip_out.returncode == 0:
            dep_summary.append("Python: OK")
        else:
            dep_summary.append("Python: vulnerabilities found")
    except Exception:
        dep_summary.append("Python audit skipped")

    results.append("## 🔒 Dependency Audit\n" + "\n".join(dep_summary))

    # ---- Write final report ----
    content = f"# Audit Report for {app_slug}\n\nGenerated: {now}\n\n" + "\n\n".join(results)
    report_file.write_text(content)

    print(f"[bold green]✓ Audit complete[/bold green]. Report at {report_file}")


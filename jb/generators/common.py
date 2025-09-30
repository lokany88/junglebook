# jb/generators/common.py
from pathlib import Path
import datetime, textwrap, json

def _w(p: Path, content: str):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.strip() + "\n")

def _now():
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

def standardize_repo_tree(app_root: Path, slug: str, idea: str, template: str):
    """
    Adds v2.0 standard folders/files INTO an already-copied template at apps/<slug>.
    This is idempotent: safe to re-run (will overwrite stubs).
    """
    # .gitignore (app-level)
    _w(app_root / ".gitignore", """
    .open-next/
    node_modules/
    .venv/
    .env
    audit/sbom.json
    audit/AuditReport.md
    """)

    # jb.config.yaml (app-level)
    _w(app_root / "jb.config.yaml", f"""
    project:
      name: "{slug}"
      description: "{idea}"
      owner: "factory"
      budget: {{ monthly_usd_cap: 50, abort_on_cap_violation: true }}
    stack:
      template: "{template}"
      regions: {{ primary: "global", fallback: "us-east-1" }}
    quality_gates:
      min_coverage: 0.75
      min_lighthouse: 0.90
      min_accessibility: 0.95
      max_p95_ms_edge: 300
      max_p95_ms_aws: 600
    security:
      sast: true
      dast: true
      sca_block_high: true
    deployment:
      strategy: canary
      auto_rollback: true
    telemetry:
      error_budget_pct: 2
      alert_channels: ["console"]
    """)

    # docs/
    _w(app_root / "docs" / "PRD.md", f"""
    # Product Requirements Document (PRD)

    ## Product Summary
    {idea}

    ## Goals
    - Ship a production-ready, audited product with ultra-low latency and cost.
    - Provide secure auth, basic CRUD for the domain, and deploy globally.

    ## Non-Goals (v1)
    - Non-core features that delay launch.
    - Heavy back-office features unless strictly required.

    ## Personas
    - Primary user(s) of this product (derived from idea).
    - Admin: manages disputes/overrides with governance controls.

    ## Success Metrics
    - Booking/Conversion ≥ 5%
    - P95 API latency < 300ms (edge) / 600ms (AWS)
    - 99.9% availability
    """)

    _w(app_root / "docs" / "ARCH.md", f"""
    # Architecture Overview

    ## High-Level
    - Frontend: Next.js (T1) or Django (T2)
    - Backend: Cloudflare Workers (T1) or AWS ECS (T2)
    - Database: D1/Turso (T1) or Postgres (T2)
    - Storage: R2/S3 (as needed)
    - Auth: Cookie sessions or JWT + refresh (HttpOnly, Secure, SameSite=Strict)

    ## Key Components
    - Core service logic for: {idea}
    - Audit Layer (immutable logs), Governance gates, Canary deploys

    ## Infra
    - Cloudflare Pages/Workers primary; AWS fallback for heavy/regulated
    """)

    _w(app_root / "docs" / "DATA.md", """
    # Data Model (baseline)

    ## Users
    - id (UUID), email, role, created_at

    ## DomainObject (example)
    - id (UUID), owner_id (fk→users), status, created_at

    ## Events (ledger)
    - id, kind, subject_id, payload (JSON), ts
    """)

    _w(app_root / "docs" / "API.md", """
    # API (summary)
    ## Health
    GET /api/health -> 200

    ## Auth
    POST /api/auth/login
    POST /api/auth/logout

    ## Domain
    POST /api/items
    GET  /api/items/{id}
    PATCH /api/items/{id}
    """)

    _w(app_root / "docs" / "UX.md", """
    # UX Flows (baseline)
    - Login → Dashboard
    - Create Item → View Item → Update Item
    - Admin: View Disputes → Resolve with evidence log
    """)

    _w(app_root / "docs" / "WORKGRAPH.yaml", f"""
    tasks:
      - id: spec-prd
        owner: architect
        output: docs/PRD.md
      - id: spec-arch
        owner: architect
        depends: [spec-prd]
        output: docs/ARCH.md
      - id: data-model
        owner: implementer
        depends: [spec-prd]
        output: docs/DATA.md
      - id: api-contract
        owner: implementer
        depends: [data-model]
        output: docs/API.md
      - id: ux-flows
        owner: architect
        depends: [spec-prd]
        output: docs/UX.md
      - id: scaffold-repo
        owner: scaffolder
        depends: [spec-prd, api-contract, data-model]
        output: apps/{slug}
      - id: audit
        owner: verifier
        depends: [scaffold-repo]
        output: audit/AuditReport.md
      - id: deploy
        owner: devops
        depends: [audit]
        output: staging+prod URLs
    """)

    # governance/
    _w(app_root / "governance" / "policy.yaml", """
    roles:
      admin: ["*"]
      user: ["read:self", "write:self"]
    slo:
      availability: "99.9%"
      p95_ms_edge: 300
      p95_ms_aws: 600
    fairness:
      max_gap_pp: 2.0
    release_gates:
      - tests_coverage: { min: 0.75 }
      - lighthouse: { min: 0.90 }
      - accessibility: { min: 0.95 }
      - security_high_blockers: { max: 0 }
      - sbom_present: true
    """)

    _w(app_root / "governance" / "dispute_tiers.yaml", """
    tiers:
      T0:
        window_hours: 24
        action: "auto-resolve if unchallenged"
      T1:
        reviewer: "assigned"
        sla_hours: 48
        ledger: true
      T2:
        panel: true
        escrow_hold: true
        sla_days: 5
      T3:
        break_glass_required: true
        rca_required: true
        deadline_days: 7
    """)

    _w(app_root / "governance" / "break_glass.yaml", """
    allowed_roles: ["admin"]
    requirements:
      - ticket_id
      - reason
      - expiry_hours
      - rca_due_days
    logging:
      file: "audit/break_glass_log.json"
    """)

    _w(app_root / "governance" / "cost_caps.yaml", """
    monthly_usd_cap: 50
    actions_on_violation:
      - "scale_to_zero_nonprod"
      - "pause_heavy_jobs"
      - "switch_storage_to_R2"
      - "notify:console"
    """)

    # audit/
    _w(app_root / "audit" / "AuditPlan.yaml", """
    gates:
      coverage: { min: 0.75 }
      lighthouse: { performance: 0.90, seo: 0.90, best_practices: 0.95 }
      accessibility: { min: 0.95 }
      latency: { p95_edge_ms: 300, p95_aws_ms: 600 }
      security: { max_high: 0 }
      sbom: { required: true }
      dr_restore: { required: true }
    """)

    _w(app_root / "audit" / "kpi_registry.yaml", """
    kpis:
      - id: conversion_rate
        owner: "growth"
        formula: "signups / unique_visitors"
        target: 0.05
      - id: activation_rate
        owner: "product"
        formula: "activated_users / signups"
        target: 0.6
      - id: p95_latency
        owner: "platform"
        formula: "p95(request_latency_ms)"
        target: 300
      - id: error_rate
        owner: "platform"
        formula: "5xx / requests"
        target: 0.01
      - id: cost_per_user
        owner: "finance"
        formula: "infra_cost / mau"
        target: 0.05
    """)

    _w(app_root / "audit" / "controls.rego", """
    package junglebook.controls

    default allow = false

    csp_ok {
      input.response_headers["content-security-policy"]
      contains(input.response_headers["content-security-policy"], "default-src 'self'")
    }

    allow {
      csp_ok
    }
    """)

    # ci/
    _w(app_root / "ci" / "pipelines.yaml", """
    name: app-ci
    on:
      push: { branches: ["main"] }
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with: { node-version: "20" }
          - name: Install deps (if Next.js)
            run: |
              if [ -f package.json ]; then npm ci; fi
          - name: Build
            run: |
              if [ -f package.json ]; then npm run build; fi
          - name: Lighthouse & a11y (TODO)
            run: echo "run lhci + axe here"
          - name: Policy checks (OPA - TODO)
            run: echo "conftest test audit/controls.rego"
          - name: Deploy staging (Cloudflare)
            if: success()
            run: |
              if [ -f package.json ]; then npm run cf:build && npm run cf:deploy; fi
          - name: Canary promote (TODO)
            run: echo "traffic split + promote when green"
    """)

    # infra/
    _w(app_root / "infra" / "cloudflare" / "pages.json", """
    {
      "buildCommand": "npm run build",
      "buildOutputDirectory": ".next",
      "envVars": { "NEXT_TELEMETRY_DISABLED": "1" }
    }
    """)

    _w(app_root / "infra" / "cloudflare" / "wrangler.example.toml", f"""
    name = "{slug}"
    main = ".open-next/worker.js"
    compatibility_date = "2024-11-21"
    compatibility_flags = ["nodejs_compat"]

    [assets]
    directory = ".open-next/assets"
    binding = "ASSETS"

    # [[d1_databases]] will be added by preset if needed
    """)

    _w(app_root / "infra" / "aws" / "main.tf", """
    terraform {
      required_version = ">= 1.6.0"
      required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
    }
    provider "aws" { region = var.region }
    variable "region" { type = string, default = "us-east-1" }
    # modules vpc/ecs/rds/iam/alb would be added as needed
    """)

    # scripts/
    _w(app_root / "scripts" / "dev-notes.md", f"""
    # Dev Notes for {slug}
    - Generated at { _now() }
    - Template: {template}
    - Idea: {idea}
    """)


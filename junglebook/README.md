# JungleBook 🐅 – Autonomous Software Factory

[![CI](https://github.com/lokany88/junglebook/actions/workflows/ci-audit.yml/badge.svg)](https://github.com/lokany88/junglebook/actions/workflows/ci-audit.yml)
[![Dependabot Status](https://img.shields.io/badge/dependabot-enabled-brightgreen?logo=dependabot)](https://github.com/lokany88/junglebook/network/updates)
[![License](https://img.shields.io/github/license/lokany88/junglebook)](LICENSE)

---

## ⚡ What is JungleBook?

JungleBook is an **ultra-intelligent instant app generator** that builds, audits, and deploys complex apps, websites, and games in **seconds** from the vaguest inputs.

- **Cloudflare-first** deployment (Workers + D1/Turso) with AWS fallback.
- **AI Architect → Interpreter → Audit** workflow ensures every build is production-ready.
- **Governance pack** enforces quality, fairness, compliance, and cost controls.
- **Lazy Manager CLI** (`jb`) manages builds, audits, presets, and deployments.

---

## 🚀 Current Capabilities

- `jb build "idea"` → creates a fully structured app + docs + governance pack.
- `jb preset next-login-charts` → adds login, D1 DB, metrics API, and chart dashboard.
- `jb audit <slug>` → runs the Million-Metric Audit (tests, Lighthouse, policies).

---

## ✅ CI / CD

- **Audit pipeline** runs on every push & PR to `main`.
- **Staging deploys** automatically on `main`.
- **Production promotion** is manual (workflow dispatch toggle).

---

## 📦 Roadmap

- Add Lazy Manager web dashboard.
- Extend template registry (Phoenix, Go, Nest).
- Auto-generate compliance reports (SOC2, DPIA, accessibility).
- Integrate GitHub Pages dashboard for audit results.

---

## 🔒 Security

JungleBook follows:

- Zero-trust hardening by default.
- Policy-as-code governance (`audit/controls.rego`).
- Cost caps and break-glass rules.

---

## 📜 License

MIT (see [LICENSE](LICENSE)).

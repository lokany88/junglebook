#!/usr/bin/env node
import { createRequire } from 'module'
import { execSync } from 'child_process'
const require = createRequire(import.meta.url)
const pkg = require('../package.json')
const args = process.argv.slice(2)
const cmd = args[0] || 'help'

if (args.includes('--version') || cmd === 'version') {
  console.log(pkg.version || '0.0.0')
  process.exit(0)
}

if (args.includes('--help') || cmd === 'help') {
  console.log(`Jungle Book CLI
Usage:
  npx jb <command>

Commands:
  doctor       Run full repository self-audit
  audit        Run npm audit and write audit-report.json
  ci           Trigger CI workflows (JB CLI Smoke + Integrity Build Gate)
  help         Show this help text
  version      Print CLI version`)
  process.exit(0)
}

if (cmd === 'doctor') {
  const { default: runDoctor } = await import('./commands/doctor.js')
  await runDoctor()
  process.exit(0)
}

if (cmd === 'audit') {
  const { default: runAudit } = await import('./commands/audit.js')
  await runAudit()
  process.exit(0)
}

if (cmd === 'ci') {
  const { execSync } = await import('child_process')
  console.log('[jb-ci] Triggering CI workflows...')
  execSync('gh workflow run "JB CLI Smoke" --ref main || true', { stdio: 'inherit' })
  execSync('gh workflow run "Integrity Build Gate" --ref main || true', { stdio: 'inherit' })
  console.log('[jb-ci] Workflows dispatched successfully.')
  process.exit(0)
}

console.error('Unknown command:', cmd)
process.exit(1)

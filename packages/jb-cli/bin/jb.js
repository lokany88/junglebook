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
  help         Show this help text
  version      Print CLI version`)
  process.exit(0)
}

if (cmd === 'doctor') {
  const { default: runDoctor } = await import('./commands/doctor.js')
  runDoctor()
  process.exit(0)
}

console.error('Unknown command:', cmd)
process.exit(1)

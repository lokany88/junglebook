import { execSync } from 'child_process'
import fs from 'fs'

export default function runAudit() {
  console.log('[jb-audit] Running npm audit...')
  try {
    const result = execSync('npm audit --json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
    fs.writeFileSync('audit-report.json', result)
    console.log('[jb-audit] audit-report.json written successfully.')
  } catch {
    console.log('[jb-audit] npm audit returned non-zero code, continuing...')
  }
  process.exit(0)
}

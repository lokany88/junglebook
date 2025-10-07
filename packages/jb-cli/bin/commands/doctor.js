import fs from 'fs'
import { execSync } from 'child_process'

export default async function runDoctor() {
  console.log('[jb-doctor] 🩺 Starting full self-heal + CI orchestrator...')

  let modified = false
  const turboPath = 'turbo.json'

  // ---- TURBO CONFIG AUDIT ----
  try {
    const content = fs.readFileSync(turboPath, 'utf-8')
    const data = JSON.parse(content)

    if (!data.schemaVersion) {
      data.schemaVersion = 1
      modified = true
      console.log('[jb-doctor] Added schemaVersion=1')
    }

    data.pipeline = data.pipeline || {}
    data.pipeline['jb-cli'] = data.pipeline['jb-cli'] || {}
    data.pipeline['web'] = data.pipeline['web'] || {}

    if (!data.pipeline['jb-cli'].outputs) {
      data.pipeline['jb-cli'].outputs = ['dist/**', 'lib/**', '*.js']
      modified = true
      console.log('[jb-doctor] Added jb-cli.outputs')
    }

    if (!data.pipeline['web'].dependsOn) {
      data.pipeline['web'].dependsOn = ['jb-cli#build']
      modified = true
      console.log('[jb-doctor] Linked web → jb-cli')
    }

    if (!data.pipeline['web'].outputs) {
      data.pipeline['web'].outputs = ['.next/**', 'dist/**']
      modified = true
      console.log('[jb-doctor] Added web.outputs')
    }

    if (modified) {
      fs.writeFileSync(turboPath, JSON.stringify(data, null, 2))
      console.log('[jb-doctor] ✅ turbo.json auto-healed.')
    } else {
      console.log('[jb-doctor] ✅ turbo.json healthy.')
    }
  } catch (err) {
    console.error('[jb-doctor] ⚠ turbo.json error:', err.message)
  }

  // ---- PACKAGE JSON VALIDATION ----
  try {
    const pkgs = execSync('find . -name package.json', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean)
    for (const file of pkgs) {
      try {
        JSON.parse(fs.readFileSync(file, 'utf-8'))
      } catch {
        console.log(`[jb-doctor] ⚠ Invalid JSON in ${file}, fixing via jq.`)
        execSync(`jq . ${file} > tmp.json && mv tmp.json ${file}`)
        modified = true
      }
    }
  } catch (err) {
    console.error('[jb-doctor] ⚠ Package validation error:', err.message)
  }

  // ---- COMMIT & PUSH ----
  if (modified) {
    try {
      execSync('git add -A', { stdio: 'inherit' })
      execSync('git commit -S -m "chore(doctor): auto-heal turbo + workspace configs"', { stdio: 'inherit' })
      execSync('git push -u origin main', { stdio: 'inherit' })
      console.log('[jb-doctor] ✅ Auto-heal committed and pushed.')
    } catch (err) {
      console.error('[jb-doctor] ⚠ Git push failed:', err.message)
    }
  } else {
    console.log('[jb-doctor] No new changes to push.')
  }

  // ---- LOCAL AUDIT ----
  try {
    console.log('[jb-doctor] 🔄 Running jb audit...')
    execSync('npx jb audit', { stdio: 'inherit' })
  } catch {
    console.log('[jb-doctor] ⚠ jb audit exited non-zero, continuing.')
  }

  // ---- REMOTE CI TRIGGER ----
  try {
    console.log('[jb-doctor] ☁️ Triggering JB CLI Smoke workflow...')
    const runId = execSync('gh workflow run "JB CLI Smoke" --ref main --json run -q .run.id', { encoding: 'utf-8' }).trim()
    console.log(`[jb-doctor] 🧩 Workflow run ID: ${runId}`)
    console.log('[jb-doctor] ⏳ Waiting for CI completion...')

    // Poll until finished
    let status = ''
    for (let i = 0; i < 60; i++) { // ~10 minutes
      status = execSync(`gh run view ${runId} --json status,conclusion -q '.status + ":" + (.conclusion // "pending")'`, { encoding: 'utf-8' }).trim()
      console.log(`[jb-doctor] CI status: ${status}`)
      if (status.startsWith('completed')) break
      await new Promise(r => setTimeout(r, 10000))
    }

    const conclusion = status.split(':')[1]
    if (conclusion === 'success') {
      console.log('[jb-doctor] ✅ CI PASSED — Repository verified healthy.')
    } else {
      console.log(`[jb-doctor] ❌ CI completed with status: ${conclusion}`)
    }
  } catch (err) {
    console.error('[jb-doctor] ⚠ Could not trigger or monitor CI:', err.message)
  }

  console.log('[jb-doctor] 🧠 Complete.')
  process.exit(0)
}

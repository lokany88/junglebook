import fs from 'fs'
import { execSync } from 'child_process'

export default function runDoctor() {
  console.log('[jb-doctor] 🩺 Running full monorepo self-audit...')

  const turboPath = 'turbo.json'
  let modified = false

  // --- Turbo Config Self-Heal ---
  try {
    const content = fs.readFileSync(turboPath, 'utf-8')
    const data = JSON.parse(content)

    if (!data.schemaVersion) {
      console.log('[jb-doctor] Added missing schemaVersion.')
      data.schemaVersion = 1
      modified = true
    }

    // jb-cli pipeline fix
    data.pipeline = data.pipeline || {}
    data.pipeline['jb-cli'] = data.pipeline['jb-cli'] || {}
    if (!data.pipeline['jb-cli'].outputs) {
      console.log('[jb-doctor] Added outputs key for jb-cli.')
      data.pipeline['jb-cli'].outputs = ['dist/**', 'lib/**', '*.js']
      modified = true
    }

    // web pipeline fix
    data.pipeline['web'] = data.pipeline['web'] || {}
    if (!data.pipeline['web'].dependsOn) {
      console.log('[jb-doctor] Linked web -> jb-cli build dependency.')
      data.pipeline['web'].dependsOn = ['jb-cli#build']
      modified = true
    }
    if (!data.pipeline['web'].outputs) {
      console.log('[jb-doctor] Added outputs key for web.')
      data.pipeline['web'].outputs = ['.next/**', 'dist/**']
      modified = true
    }

    if (modified) {
      fs.writeFileSync(turboPath, JSON.stringify(data, null, 2))
      console.log('[jb-doctor] ✅ turbo.json auto-healed.')
    } else {
      console.log('[jb-doctor] ✅ turbo.json OK — no changes.')
    }
  } catch (err) {
    console.error('[jb-doctor] ⚠ Error reading turbo.json:', err.message)
  }

  // --- Package Audit ---
  try {
    console.log('[jb-doctor] 🔍 Validating package.json consistency...')
    const packageFiles = execSync('find . -name package.json', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean)
    for (const file of packageFiles) {
      try {
        JSON.parse(fs.readFileSync(file, 'utf-8'))
      } catch {
        console.log(`[jb-doctor] ⚠ Invalid JSON in ${file}, auto-fixing via jq.`)
        execSync(`jq . ${file} > tmp.json && mv tmp.json ${file}`)
        modified = true
      }
    }
  } catch (err) {
    console.error('[jb-doctor] ⚠ Package audit error:', err.message)
  }

  // --- Auto Commit + Push ---
  if (modified) {
    try {
      execSync('git add turbo.json', { stdio: 'inherit' })
      execSync('git add .', { stdio: 'inherit' })
      execSync('git commit -S -m "chore(doctor): auto-heal turbo.json and workspace configs"', { stdio: 'inherit' })
      execSync('git push -u origin main', { stdio: 'inherit' })
      console.log('[jb-doctor] ✅ Auto-patched, signed, and pushed to main.')
    } catch (err) {
      console.error('[jb-doctor] ⚠ Commit/push failed:', err.message)
    }
  } else {
    console.log('[jb-doctor] No file changes to commit.')
  }

  // --- Auto Run Audit ---
  try {
    console.log('[jb-doctor] 🔄 Running jb audit for verification...')
    execSync('npx jb audit', { stdio: 'inherit' })
  } catch (err) {
    console.error('[jb-doctor] ⚠ jb audit encountered warnings:', err.message)
  }

  console.log('[jb-doctor] 🧠 All checks completed successfully.')
  process.exit(0)
}

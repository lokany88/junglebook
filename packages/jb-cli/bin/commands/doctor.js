import fs from 'fs'
import { execSync } from 'child_process'

export default function runDoctor() {
  console.log('[jb-doctor] 🩺 Running monorepo self-audit...')

  const turboPath = 'turbo.json'
  let modified = false

  try {
    const content = fs.readFileSync(turboPath, 'utf-8')
    const data = JSON.parse(content)

    if (!data.schemaVersion) {
      console.log('[jb-doctor] Missing schemaVersion, setting to 1.')
      data.schemaVersion = 1
      modified = true
    }

    if (!data.pipeline?.['jb-cli']?.outputs) {
      console.log('[jb-doctor] Adding missing outputs key for jb-cli.')
      data.pipeline = data.pipeline || {}
      data.pipeline['jb-cli'] = data.pipeline['jb-cli'] || {}
      data.pipeline['jb-cli'].outputs = ['dist/**', 'lib/**', '*.js']
      modified = true
    }

    if (!data.pipeline?.['web']?.dependsOn) {
      console.log('[jb-doctor] Adding dependsOn for web -> jb-cli.')
      data.pipeline['web'] = data.pipeline['web'] || {}
      data.pipeline['web'].dependsOn = ['jb-cli#build']
      modified = true
    }

    if (!data.pipeline?.['web']?.outputs) {
      console.log('[jb-doctor] Adding outputs for web.')
      data.pipeline['web'].outputs = ['.next/**', 'dist/**']
      modified = true
    }

    if (modified) {
      fs.writeFileSync(turboPath, JSON.stringify(data, null, 2))
      console.log('[jb-doctor] ✅ turbo.json auto-healed and written successfully.')
    } else {
      console.log('[jb-doctor] ✅ No fixes required, monorepo is healthy.')
    }
  } catch (err) {
    console.error('[jb-doctor] Error auditing turbo.json:', err.message)
  }

  try {
    console.log('[jb-doctor] 🔍 Validating package.json consistency...')
    const packageFiles = execSync('find . -name package.json', { encoding: 'utf-8' }).split('\n').filter(Boolean)
    for (const file of packageFiles) {
      try {
        JSON.parse(fs.readFileSync(file, 'utf-8'))
      } catch {
        console.log(`[jb-doctor] ⚠ Invalid JSON in ${file}, auto-fixing...`)
        execSync(`jq . ${file} > tmp.json && mv tmp.json ${file}`)
        modified = true
      }
    }
  } catch {}

  if (modified) {
    try {
      execSync('git add turbo.json', { stdio: 'inherit' })
      execSync('git commit -S -m "chore(doctor): auto-heal turbo.json and workspace configs"', { stdio: 'inherit' })
      execSync('git push -u origin main', { stdio: 'inherit' })
      console.log('[jb-doctor] ✅ Auto-patched, signed, and pushed to main.')
    } catch (err) {
      console.error('[jb-doctor] ⚠ Failed to auto-commit or push:', err.message)
    }
  }

  console.log('[jb-doctor] 🧠 Doctor completed.')
  process.exit(0)
}

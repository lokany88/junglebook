import { execSync } from 'child_process'

export default async function runCI() {
  console.log('[jb-ci] Starting remote CI verification run...')
  try {
    const runId = execSync(
      'gh workflow run "JB CLI Smoke" --ref main --json run -q .run.id',
      { encoding: 'utf-8' }
    ).trim()
    console.log('[jb-ci] Workflow run ID: ' + runId)
    console.log('[jb-ci] Waiting for CI completion...')
    let status = ''
    for (let i = 0; i < 60; i++) {
      status = execSync(
        'gh run view ' + runId + ' --json status,conclusion -q \'.status + ":" + (.conclusion // "pending")\'',
        { encoding: 'utf-8' }
      ).trim()
      console.log('[jb-ci] CI status: ' + status)
      if (status.startsWith('completed')) break
      await new Promise(r => setTimeout(r, 10000))
    }
    const conclusion = status.split(':')[1]
    if (conclusion === 'success') {
      console.log('[jb-ci] CI PASSED — main branch verified clean.')
    } else {
      console.log('[jb-ci] CI completed with status: ' + conclusion)
    }
  } catch (err) {
    console.error('[jb-ci] CI orchestration failed: ' + err.message)
  }
  console.log('[jb-ci] Complete.')
  process.exit(0)
}

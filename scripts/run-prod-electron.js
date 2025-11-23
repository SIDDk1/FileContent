const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '127.0.0.1'
const cwd = process.cwd()

function run(cmd, args, opts = {}) {
  const useShell = process.platform === 'win32'
  const p = spawn(cmd, args, Object.assign({ stdio: 'inherit', shell: useShell, cwd }, opts))
  return new Promise((resolve, reject) => {
    p.on('exit', code => {
      if (code === 0) resolve(code)
      else reject(new Error(`${cmd} exited with ${code}`))
    })
    p.on('error', reject)
  })
}

function waitForServer(url, timeout = 60000, interval = 1000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    ;(function check() {
      const req = http.get(url, res => {
        res.resume()
        resolve()
      })
      req.on('error', () => {
        if (Date.now() - start > timeout) reject(new Error('Timed out waiting for server'))
        else setTimeout(check, interval)
      })
      req.setTimeout(2000, () => req.abort())
    })()
  })
}

async function main() {
  try {
    console.log('Running production build...')
    await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'])

    console.log('Starting production server (next start)...')
    // start next start in detached mode so we can continue to monitor
    const serverCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    const server = spawn(serverCmd, ['run', 'start', '--', '--hostname', HOST, '--port', String(PORT)], {
      cwd,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    })

    server.stdout.on('data', d => process.stdout.write(`[next] ${d}`))
    server.stderr.on('data', d => process.stderr.write(`[next] ${d}`))

    // give it a short grace period before polling
    const url = `http://${HOST}:${PORT}`
    console.log('Waiting for server to be reachable at', url)
    await waitForServer(url)
    console.log('Server is up')

    // find electron binary
    const electronBin = path.join(cwd, 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron')
    const electronCmd = require('fs').existsSync(electronBin) ? electronBin : 'npx'
    const electronArgs = require('fs').existsSync(electronBin) ? ['.','--no-sandbox'] : ['electron','.','--no-sandbox']

    console.log('Launching Electron...')
  const elect = spawn(electronCmd, electronArgs, { stdio: 'inherit', cwd, shell: process.platform === 'win32' })
    elect.on('exit', code => {
      console.log('Electron exited with', code)
      process.exit(code || 0)
    })
    elect.on('error', err => {
      console.error('Failed to launch Electron:', err)
      process.exit(1)
    })

  } catch (err) {
    console.error('Error in run-prod-electron:', err)
    process.exit(1)
  }
}

main()

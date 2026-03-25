const { spawn, exec, execSync } = require('child_process')
const http = require('http')
const path = require('path')
const fs = require('fs')

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
  let attempt = 0
  return new Promise((resolve, reject) => {
    ;(function check() {
      attempt++
      const req = http.get(url, { timeout: 3000 }, res => {
        res.resume()
        console.log(`✓ Server responded with status ${res.statusCode}`)
        resolve()
      })
      req.on('error', (err) => {
        const elapsed = Date.now() - start
        if (elapsed > timeout) {
          reject(new Error(`Timed out waiting for server after ${Math.round(elapsed/1000)}s. Last error: ${err.message}`))
        } else {
          // Only log every 5 attempts to avoid spam
          if (attempt % 5 === 0) {
            process.stdout.write(`\rWaiting... (${Math.round(elapsed/1000)}s)`)
          }
          setTimeout(check, interval)
        }
      })
      req.on('timeout', () => {
        req.destroy()
        const elapsed = Date.now() - start
        if (elapsed > timeout) {
          reject(new Error(`Timed out waiting for server after ${Math.round(elapsed/1000)}s`))
        } else {
          setTimeout(check, interval)
        }
      })
    })()
  })
}

async function main() {
  try {
    console.log('Running production build...')
    await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'])

    console.log('Starting production server...')
    
    // Check if standalone build exists
    const standaloneServer = path.join(cwd, '.next', 'standalone', 'server.js')
    const standaloneDir = path.join(cwd, '.next', 'standalone')
    
    let server
    if (fs.existsSync(standaloneServer)) {
      // Set up standalone server with required files
      console.log('Setting up standalone server...')
      try {
        // Ensure .next/static is accessible
        const staticSource = path.join(cwd, '.next', 'static')
        const staticDest = path.join(standaloneDir, '.next', 'static')
        const staticDestDir = path.join(standaloneDir, '.next')
        
        if (fs.existsSync(staticSource)) {
          if (!fs.existsSync(staticDestDir)) {
            fs.mkdirSync(staticDestDir, { recursive: true })
          }
          if (!fs.existsSync(staticDest)) {
            // Try symlink first, fallback to relative path expectation
            try {
              if (process.platform === 'win32') {
                // Windows: use junction for directories
                execSync(`mklink /J "${staticDest}" "${staticSource}"`, { stdio: 'ignore' })
              } else {
                fs.symlinkSync(path.resolve(staticSource), path.resolve(staticDest), 'dir')
              }
              console.log('✓ Linked .next/static')
            } catch (linkErr) {
              // If symlink fails, the server should still work with relative paths from project root
              console.log('Note: Using relative paths for static files')
            }
          }
        }
        
        // Ensure public is accessible
        const publicSource = path.join(cwd, 'public')
        const publicDest = path.join(standaloneDir, 'public')
        
        if (fs.existsSync(publicSource) && !fs.existsSync(publicDest)) {
          try {
            if (process.platform === 'win32') {
              execSync(`mklink /J "${publicDest}" "${publicSource}"`, { stdio: 'ignore' })
            } else {
              fs.symlinkSync(path.resolve(publicSource), path.resolve(publicDest), 'dir')
            }
            console.log('✓ Linked public folder')
          } catch (linkErr) {
            console.log('Note: Using relative paths for public files')
          }
        }
        
        // Run standalone server from standalone directory (as Next.js expects)
        console.log('Starting standalone server...')
        const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node'
        server = spawn(nodeCmd, ['server.js'], {
          cwd: standaloneDir,  // Run from standalone directory
          shell: process.platform === 'win32',
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: true,
          env: { 
            ...process.env, 
            PORT, 
            HOSTNAME: HOST === '0.0.0.0' ? '0.0.0.0' : HOST,
            NODE_ENV: 'production',
            NEXT_TELEMETRY_DISABLED: '1'
          }
        })
      } catch (setupErr) {
        console.error('Failed to set up standalone server:', setupErr.message)
        console.log('Falling back to next start...')
        const serverCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
        server = spawn(serverCmd, ['run', 'start', '--', '--hostname', HOST, '--port', String(PORT)], {
          cwd,
          shell: process.platform === 'win32',
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: true,
        })
      }
    } else {
      // No standalone build, use next start
      console.log('Using next start...')
      const serverCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
      server = spawn(serverCmd, ['run', 'start', '--', '--hostname', HOST, '--port', String(PORT)], {
        cwd,
        shell: process.platform === 'win32',
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true,
      })
    }

    let serverOutput = ''
    let serverError = ''
    
    server.stdout.on('data', d => {
      const output = d.toString()
      serverOutput += output
      process.stdout.write(`[next] ${output}`)
      // Check if server is ready
      if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
        console.log('\n✓ Server appears to be ready')
      }
    })
    server.stderr.on('data', d => {
      const output = d.toString()
      serverError += output
      process.stderr.write(`[next] ${output}`)
      // Log warnings but don't fail on them
      if (output.includes('standalone')) {
        console.log('\n⚠ Standalone warning (can be ignored for Electron)')
      }
      // Check for fatal errors
      if (output.includes('Error') || output.includes('Failed') || output.includes('EADDRINUSE')) {
        console.error('\n✗ Server error detected:', output)
      }
    })
    
    server.on('error', err => {
      console.error('Server process error:', err)
      serverError += err.message
    })
    
    server.on('exit', (code, signal) => {
      if (code !== null && code !== 0) {
        console.error(`\n✗ Server process exited with code ${code}`)
        if (serverError) {
          console.error('Server error output:', serverError)
        }
        if (serverOutput) {
          console.error('Server output:', serverOutput)
        }
      }
    })

    // give it a short grace period before polling
    const url = `http://${HOST}:${PORT}`
    console.log('Waiting for server to be reachable at', url)
    console.log('(This may take a few seconds...)')
    try {
      await waitForServer(url)
      console.log('✓ Server is up and reachable')
    } catch (err) {
      console.error('✗ Server failed to start:', err.message)
      console.log('Server output may contain more details above')
      // Don't exit immediately - let user see what happened
      process.exit(1)
    }

    // find electron binary
    const electronBin = path.join(cwd, 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron')
    const electronMainPath = path.join(cwd, 'electron-main.js')
    
    console.log('Launching Electron...')
    console.log('Working directory:', cwd)
    
    // On Windows with paths containing spaces, use exec with proper quoting
    if (process.platform === 'win32') {
      let electronCommand
      if (fs.existsSync(electronBin)) {
        // Quote the path to handle spaces, and pass electron-main.js as argument
        electronCommand = `"${electronBin}" "${electronMainPath}" --no-sandbox`
      } else {
        electronCommand = `npx electron "${electronMainPath}" --no-sandbox`
      }
      
      console.log('Electron command:', electronCommand)
      const elect = exec(electronCommand, { 
        cwd, 
        env: { ...process.env, PORT, HOST }
      })
      
      elect.stdout?.pipe(process.stdout)
      elect.stderr?.pipe(process.stderr)
      
      elect.on('exit', code => {
        console.log('Electron exited with', code)
        process.exit(code || 0)
      })
      
      elect.on('error', err => {
        console.error('Failed to launch Electron:', err)
        process.exit(1)
      })
    } else {
      // On Unix-like systems, use spawn
      let electronCmd, electronArgs
      if (fs.existsSync(electronBin)) {
        electronCmd = electronBin
        electronArgs = [electronMainPath, '--no-sandbox']
      } else {
        electronCmd = 'npx'
        electronArgs = ['electron', electronMainPath, '--no-sandbox']
      }
      
      const elect = spawn(electronCmd, electronArgs, { 
        stdio: 'inherit', 
        cwd, 
        env: { ...process.env, PORT, HOST }
      })
      elect.on('exit', code => {
        console.log('Electron exited with', code)
        process.exit(code || 0)
      })
      elect.on('error', err => {
        console.error('Failed to launch Electron:', err)
        process.exit(1)
      })
    }

  } catch (err) {
    console.error('Error in run-prod-electron:', err)
    process.exit(1)
  }
}

main()

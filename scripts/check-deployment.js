#!/usr/bin/env node

/**
 * Deployment health check script
 * Verifies that all required services are running and configured correctly
 */

const http = require('http');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkService(name, url, timeout = 5000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(url, (res) => {
      const duration = Date.now() - start;
      resolve({ success: true, status: res.statusCode, duration });
    });

    req.on('error', () => {
      resolve({ success: false });
    });

    req.setTimeout(timeout, () => {
      req.abort();
      resolve({ success: false, timeout: true });
    });
  });
}

async function checkOllama() {
  const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
  log(`\n🔍 Checking Ollama at ${ollamaUrl}...`, colors.blue);
  
  const health = await checkService('Ollama', `${ollamaUrl}/api/tags`);
  
  if (health.success) {
    log(`✅ Ollama is running (${health.duration}ms)`, colors.green);
    
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      const data = await response.json();
      const models = data.models || [];
      
      if (models.length > 0) {
        log(`   Models available: ${models.map(m => m.name).join(', ')}`, colors.green);
      } else {
        log(`   ⚠️  No models found. Pull a model with: ollama pull gemma2:2b`, colors.yellow);
      }
    } catch (e) {
      log(`   ⚠️  Could not fetch model list`, colors.yellow);
    }
    return true;
  } else {
    log(`❌ Ollama is not accessible`, colors.red);
    log(`   Make sure Ollama is running: ollama serve`, colors.yellow);
    return false;
  }
}

async function checkNextJS() {
  const port = process.env.PORT || 3000;
  const url = `http://localhost:${port}`;
  log(`\n🔍 Checking Next.js application at ${url}...`, colors.blue);
  
  const health = await checkService('Next.js', url);
  
  if (health.success) {
    log(`✅ Next.js application is running (${health.duration}ms)`, colors.green);
    return true;
  } else {
    log(`❌ Next.js application is not running`, colors.red);
    log(`   Start it with: npm start`, colors.yellow);
    return false;
  }
}

function checkEnvironmentVariables() {
  log(`\n🔍 Checking environment variables...`, colors.blue);
  
  const required = ['OLLAMA_API_URL'];
  const optional = ['PORT', 'HOST', 'NODE_ENV'];
  
  let allGood = true;
  
  for (const varName of required) {
    if (process.env[varName]) {
      log(`✅ ${varName} is set: ${process.env[varName]}`, colors.green);
    } else {
      log(`❌ ${varName} is not set`, colors.red);
      allGood = false;
    }
  }
  
  for (const varName of optional) {
    if (process.env[varName]) {
      log(`ℹ️  ${varName}: ${process.env[varName]}`, colors.blue);
    } else {
      log(`ℹ️  ${varName}: using default`, colors.blue);
    }
  }
  
  return allGood;
}

function checkBuild() {
  log(`\n🔍 Checking build status...`, colors.blue);
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    if (fs.existsSync(path.join(process.cwd(), '.next'))) {
      log(`✅ Build directory exists`, colors.green);
      return true;
    } else {
      log(`❌ Build directory not found`, colors.red);
      log(`   Build the application with: npm run build`, colors.yellow);
      return false;
    }
  } catch (e) {
    log(`❌ Error checking build: ${e.message}`, colors.red);
    return false;
  }
}

async function main() {
  log(`\n${'='.repeat(50)}`, colors.blue);
  log(`📋 Deployment Health Check`, colors.blue);
  log(`${'='.repeat(50)}`, colors.blue);
  
  const results = {
    build: checkBuild(),
    env: checkEnvironmentVariables(),
    nextjs: await checkNextJS(),
    ollama: await checkOllama(),
  };
  
  log(`\n${'='.repeat(50)}`, colors.blue);
  log(`📊 Summary`, colors.blue);
  log(`${'='.repeat(50)}`, colors.blue);
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log(`\n✅ All checks passed! Your deployment is ready.`, colors.green);
    process.exit(0);
  } else {
    log(`\n⚠️  Some checks failed. Please review the issues above.`, colors.yellow);
    process.exit(1);
  }
}

// Use fetch if available (Node 18+), otherwise use http
if (typeof fetch === 'undefined') {
  global.fetch = async (url) => {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            json: async () => JSON.parse(data),
            ok: res.statusCode >= 200 && res.statusCode < 300,
          });
        });
      }).on('error', reject);
    });
  };
}

main().catch((error) => {
  log(`\n❌ Error during health check: ${error.message}`, colors.red);
  process.exit(1);
});


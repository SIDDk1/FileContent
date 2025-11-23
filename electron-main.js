const { app, BrowserWindow } = require('electron')
const path = require('path')

// Read port from env or default to 3000
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // disable nodeIntegration for security; enable if you need it
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  const url = `http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}`
  win.loadURL(url)
  // Open devtools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

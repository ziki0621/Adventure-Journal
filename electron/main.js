const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;

function startServer() {
  return new Promise((resolve) => {
    const serverPath = path.join(__dirname, '..', 'backend', 'server.js');
    const dataDir = path.join(app.getPath('userData'), 'data');
    serverProcess = fork(serverPath, [], {
      env: { ...process.env, PORT: '0', ADVENTURE_DATA_DIR: dataDir },
      silent: true,
    });
    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      const match = text.match(/running at http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) resolve(Number(match[1]));
    });
  });
}

async function createWindow() {
  const port = await startServer();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: 'Adventure Ledger',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL('http://127.0.0.1:' + port);
  mainWindow.setTitle('Adventure Ledger');

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

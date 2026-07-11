/* Adventure Journal — standalone desktop launcher (cross-platform) */
const { spawn, execSync, exec } = require('child_process');
const path = require('path');
const http = require('http');
const os = require('os');
const PORT = 4173;

const server = spawn('node', [path.join(__dirname, 'backend', 'server.js')], {
  stdio: 'ignore',
  detached: false,
});

console.log('Starting server...');

function tryOpen(retry = 0) {
  const req = http.get(`http://127.0.0.1:${PORT}/`, (res) => {
    const url = `http://127.0.0.1:${PORT}/`;
    const platform = os.platform();

    // Detect available browsers
    let browserCmd = null;
    try {
      if (platform === 'darwin') {
        browserCmd = 'open -a "Google Chrome" --args --app=' + url;
      } else if (platform === 'linux') {
        browserCmd = `google-chrome --app="${url}" || chromium --app="${url}"`;
      } else {
        // Windows
        const where = execSync('where chrome 2>nul', { encoding: 'utf8' });
        if (where.includes('chrome')) {
          browserCmd = `start chrome --app="${url}"`;
        } else {
          const where2 = execSync('where msedge 2>nul', { encoding: 'utf8' });
          if (where2.includes('msedge')) {
            browserCmd = `start msedge --app="${url}"`;
          }
        }
      }
    } catch (e) {}

    if (browserCmd) {
      exec(browserCmd);
      console.log('Launched in standalone app window.');
    } else {
      const startCmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${startCmd} ${url}`);
      console.log('No Chrome/Edge found — opened in default browser.');
    }
    console.log(`Server: ${url}`);
  });

  req.on('error', () => {
    if (retry < 20) setTimeout(() => tryOpen(retry + 1), 300);
  });
  req.end();
}

setTimeout(() => tryOpen(), 800);

server.stdout?.on('data', (d) => process.stdout.write(d));
server.stderr?.on('data', (d) => process.stderr.write(d));
process.on('SIGINT', () => { server.kill(); process.exit(); });

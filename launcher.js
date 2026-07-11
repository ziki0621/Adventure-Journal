/* Built-in launcher — this is the pkg entry point.
   Starts Express server, then opens browser in standalone window. */
const { spawn, execSync, exec } = require('child_process');
const http = require('http');
const path = require('path');
const os = require('os');
const PORT = 4173;

// Start the actual server
require('./backend/server.js');

// After a moment, try opening the browser
setTimeout(() => {
  const url = `http://127.0.0.1:${PORT}/`;
  const platform = os.platform();

  try {
    let browserCmd = null;
    if (platform === 'darwin') {
      browserCmd = 'open -a "Google Chrome" --args --app=' + url;
    } else if (platform === 'win32') {
      browserCmd = `start chrome --app="${url}"`;
    } else {
      browserCmd = `google-chrome --app="${url}"`;
    }
    exec(browserCmd);
    console.log('App window opened.');
  } catch (e) {
    // Fallback: just open default browser
    const startCmd = platform === 'darwin' ? 'open' : 'start';
    exec(`${startCmd} ${url}`);
  }
}, 1500);

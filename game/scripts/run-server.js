const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const serverDir = path.join(root, 'eglercraft-server');
const serverScript = path.join(serverDir, 'server.js');
const serverConfigPath = path.join(root, 'eglercraft-server-config.json');

if (!fs.existsSync(serverDir)) {
  console.error('Missing eglercraft-server directory. Run npm run setup first.');
  process.exit(1);
}

if (!fs.existsSync(serverScript)) {
  console.error('Could not find server.js in eglercraft-server. Please verify the repository contents.');
  process.exit(1);
}

console.log('Starting Eglercraft horror server...');
console.log(`Using config: ${serverConfigPath}`);

const child = spawn(process.execPath, [serverScript], {
  cwd: serverDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    HORROR_CONFIG: path.join(root, 'config.json'),
    EGCRAFT_CONFIG: serverConfigPath
  }
});

child.on('exit', (code) => process.exit(code));
child.on('error', (err) => {
  console.error('Failed to launch server:', err);
  process.exit(1);
});

#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

const serverPath = path.join(__dirname, '..', 'src', 'server', 'index.js');
const args = process.argv.slice(2);

const child = spawn('node', [serverPath, ...args], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code) => process.exit(code));
child.on('error', (err) => {
  console.error('启动失败:', err);
  process.exit(1);
});

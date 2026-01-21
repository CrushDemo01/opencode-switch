#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

// 获取 server.js 的绝对路径
const serverPath = path.join(__dirname, '..', 'server.js');

// 传递所有命令行参数给 server.js
const args = process.argv.slice(2);

// 启动 server.js
const child = spawn('node', [serverPath, ...args], {
  stdio: 'inherit',
  env: process.env
});

// 处理退出
child.on('exit', (code) => {
  process.exit(code);
});

// 处理错误
child.on('error', (err) => {
  console.error('启动失败:', err);
  process.exit(1);
});

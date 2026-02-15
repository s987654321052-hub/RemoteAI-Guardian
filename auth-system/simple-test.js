#!/usr/bin/env node

/**
 * 超簡單測試伺服器 - 排查 502 問題
 */

const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'ok',
    method: req.method,
    path: req.url,
    timestamp: new Date().toISOString()
  }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ 伺服器已啟動`);
  console.log(`📌 端口: ${PORT}`);
  console.log(`🔗 地址: http://0.0.0.0:${PORT}`);
  console.log(`\n準備接受請求...\n`);
});

server.on('error', (err) => {
  console.error('❌ 伺服器錯誤:', err);
  process.exit(1);
});

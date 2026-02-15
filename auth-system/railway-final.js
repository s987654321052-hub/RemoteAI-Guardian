#!/usr/bin/env node

/**
 * 最終版本 - Railway 啟動腳本
 * 強制使用 3000 端口（不讀取環境變數）
 */

console.log('[START] 應用初始化開始...');

const express = require('express');
console.log('[INIT] Express 已加載');

const app = express();
app.use(express.json());
console.log('[INIT] Express 中間件已配置');

// 根路由
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', app: 'RemoteAI Guardian' });
});

// 健康檢查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Webhook
app.post('/webhook/line', (req, res) => {
  console.log('[WEBHOOK] LINE webhook called');
  res.status(200).send('OK');
});

// API 狀態
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'running', time: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// 強制使用 3000（不讀取 PORT 環境變數）
const PORT = 3000;
console.log('[CONFIG] 端口: ' + PORT + ' (硬寫死)');

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('[SUCCESS] 伺服器已啟動');
  console.log('[INFO] 監聽 0.0.0.0:' + PORT);
  console.log('[INFO] 環境：' + (process.env.NODE_ENV || 'production'));
});

server.on('error', (err) => {
  console.error('[ERROR] 伺服器啟動失敗:', err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('[SIGNAL] 收到 SIGTERM，關閉伺服器');
  server.close(() => process.exit(0));
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] 未捕獲異常:', err);
  process.exit(1);
});

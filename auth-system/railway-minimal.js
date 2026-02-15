#!/usr/bin/env node

/**
 * 最小化 Railway 應用 - 純粹測試
 * 只用來診斷 502 問題
 */

const express = require('express');

const app = express();
app.use(express.json());

console.log('🚀 應用初始化中...');

// 根路由
app.get('/', (req, res) => {
  console.log('GET /');
  res.status(200).json({ status: 'ok', message: 'RemoteAI Guardian 運行中' });
});

// 健康檢查
app.get('/health', (req, res) => {
  console.log('GET /health');
  res.status(200).json({ status: 'ok' });
});

// Webhook
app.post('/webhook/line', (req, res) => {
  console.log('POST /webhook/line');
  res.status(200).send('OK');
});

// API 狀態
app.get('/api/status', (req, res) => {
  console.log('GET /api/status');
  res.status(200).json({ 
    status: 'running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('❌ 錯誤:', err.message);
  res.status(500).json({ error: err.message });
});

// 404 處理
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ 應用已啟動`);
  console.log(`📌 端口: ${PORT}`);
  console.log(`📝 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 主機: 0.0.0.0`);
  console.log(`\n準備接受請求...\n`);
});

server.on('error', (err) => {
  console.error('❌ 伺服器錯誤:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ 未捕獲異常:', err);
  process.exit(1);
});

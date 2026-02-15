#!/usr/bin/env node

/**
 * RemoteAI Guardian - 完整遠端指令系統
 * 支持 LINE 訊息、任務隊列、進度報告
 */

require('dotenv').config();

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// 導入模塊
const RemoteCommandSystem = require('./remote-command-system');
const LineCommandHandler = require('./line-command-handler');

console.log('[START] RemoteAI Guardian 啟動...');

const app = express();
app.use(express.json());

// LINE 配置
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;

console.log('[CONFIG] LINE_ACCESS_TOKEN: ' + (LINE_ACCESS_TOKEN ? '已設置' : '❌ 未設置'));
console.log('[CONFIG] LINE_USER_ID: ' + (LINE_USER_ID ? LINE_USER_ID : '❌ 未設置'));

// 初始化系統
const commandSystem = new RemoteCommandSystem();
const commandHandler = new LineCommandHandler(commandSystem, { sendMessage: sendLineMessage });

// 認證系統狀態
const pairedDevices = new Map();
const activeTokens = new Map();
const logs = [];

// ==================== 基本路由 ====================

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    app: 'RemoteAI Guardian',
    version: '1.0.0',
    features: ['LINE Commands', 'Task Queue', 'Progress Tracking', 'Device Pairing']
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// ==================== LINE Webhook ====================

app.post('/webhook/line', async (req, res) => {
  res.status(200).send('OK');

  try {
    console.log('[WEBHOOK] LINE webhook 請求接收');

    if (!req.body || !req.body.events || req.body.events.length === 0) {
      return;
    }

    const { events } = req.body;

    for (const event of events) {
      try {
        if (event.type === 'message' && event.message?.type === 'text') {
          const userId = event.source?.userId;
          const message = event.message.text;

          console.log('[MESSAGE] 用戶: ' + userId + ' | 內容: ' + message);

          // 檢查授權
          if (userId !== LINE_USER_ID) {
            console.log('[AUTH] 未授權用戶');
            await sendLineMessage(userId, '❌ 你沒有權限使用此系統');
            continue;
          }

          // 處理命令
          const reply = await commandHandler.handleCommand(userId, message);
          await sendLineMessage(userId, reply);
        }
      } catch (err) {
        console.error('[EVENT_ERROR] ' + err.message);
      }
    }
  } catch (err) {
    console.error('[WEBHOOK_ERROR] ' + err.message);
  }
});

// ==================== 任務 API ====================

// 獲取所有任務
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = commandSystem.getAllTasks();
    res.status(200).json({ success: true, tasks: tasks, total: tasks.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 獲取執行中的任務
app.get('/api/tasks/running', (req, res) => {
  try {
    const tasks = commandSystem.getRunningTasks();
    res.status(200).json({ success: true, tasks: tasks, total: tasks.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 創建任務
app.post('/api/tasks', (req, res) => {
  try {
    const { commandName, args } = req.body;
    
    if (!commandName) {
      return res.status(400).json({ error: 'commandName 是必需的' });
    }
    
    const task = commandSystem.createTask(commandName, args || {});
    commandSystem.startTask(task.id);
    
    res.status(201).json({ success: true, task: task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 獲取單個任務
app.get('/api/tasks/:taskId', (req, res) => {
  try {
    const task = commandSystem.getTask(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: '任務不存在' });
    }
    
    res.status(200).json({ success: true, task: task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新任務進度
app.put('/api/tasks/:taskId/progress', (req, res) => {
  try {
    const { progress, message } = req.body;
    
    if (progress === undefined) {
      return res.status(400).json({ error: 'progress 是必需的' });
    }
    
    const task = commandSystem.updateProgress(req.params.taskId, progress, message);
    res.status(200).json({ success: true, task: task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 完成任務
app.post('/api/tasks/:taskId/complete', (req, res) => {
  try {
    const task = commandSystem.completeTask(req.params.taskId, req.body.result);
    res.status(200).json({ success: true, task: task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 取消任務
app.post('/api/tasks/:taskId/cancel', (req, res) => {
  try {
    const task = commandSystem.cancelTask(req.params.taskId);
    res.status(200).json({ success: true, task: task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 獲取任務統計
app.get('/api/tasks/stats/all', (req, res) => {
  try {
    const stats = commandSystem.getStats();
    res.status(200).json({ success: true, stats: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 獲取任務歷史
app.get('/api/tasks/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = commandSystem.getHistory(limit);
    res.status(200).json({ success: true, history: history, total: history.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== 設備配對 API ====================

app.post('/api/pair/request', (req, res) => {
  try {
    const { deviceName } = req.body;
    
    if (!deviceName) {
      return res.status(400).json({ error: '缺少 deviceName' });
    }
    
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const pairingId = uuidv4();
    
    pairedDevices.set(pairingId, {
      code: pairingCode,
      deviceName: deviceName,
      status: 'PENDING',
      expiresAt: Date.now() + 10 * 60 * 1000,
      createdAt: new Date().toISOString()
    });
    
    console.log('[PAIR] 配對請求: ' + deviceName);
    
    res.status(200).json({
      success: true,
      pairingId: pairingId,
      pairingCode: pairingCode,
      expiresIn: 600
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pair/confirm', (req, res) => {
  try {
    const { pairingId, pairingCode, deviceUUID } = req.body;
    
    const pairing = pairedDevices.get(pairingId);
    
    if (!pairing) {
      return res.status(404).json({ error: '配對請求不存在' });
    }
    
    if (Date.now() > pairing.expiresAt) {
      pairedDevices.delete(pairingId);
      return res.status(400).json({ error: '配對碼已過期' });
    }
    
    if (pairing.code !== pairingCode) {
      return res.status(400).json({ error: '配對碼不正確' });
    }
    
    const deviceToken = generateToken();
    const refreshToken = generateToken(true);
    
    pairing.status = 'CONFIRMED';
    pairing.deviceUUID = deviceUUID;
    pairing.deviceToken = deviceToken;
    pairing.refreshToken = refreshToken;
    pairing.confirmedAt = new Date().toISOString();
    
    activeTokens.set(deviceToken, {
      deviceId: pairingId,
      deviceUUID: deviceUUID,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });
    
    console.log('[PAIR] 配對已確認: ' + pairing.deviceName);
    
    res.status(200).json({
      success: true,
      deviceToken: deviceToken,
      refreshToken: refreshToken,
      expiresIn: 86400
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '缺少授權令牌' });
    }
    
    const token = authHeader.slice(7);
    const tokenData = activeTokens.get(token);
    
    if (!tokenData || Date.now() > tokenData.expiresAt) {
      return res.status(401).json({ error: '令牌無效或已過期' });
    }
    
    const pairing = pairedDevices.get(tokenData.deviceId);
    
    res.status(200).json({
      success: true,
      isValid: true,
      deviceName: pairing.deviceName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/devices', (req, res) => {
  try {
    const devices = Array.from(pairedDevices.values()).map(p => ({
      deviceName: p.deviceName,
      status: p.status,
      confirmedAt: p.confirmedAt
    }));
    
    res.status(200).json({ success: true, devices: devices, total: devices.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== 系統狀態 ====================

app.get('/api/status', (req, res) => {
  try {
    const stats = commandSystem.getStats();
    res.status(200).json({
      status: 'running',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      lineConfigured: !!LINE_ACCESS_TOKEN && !!LINE_USER_ID,
      commandSystem: stats,
      pairedDevices: pairedDevices.size
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// ==================== 輔助函數 ====================

async function sendLineMessage(userId, message) {
  if (!LINE_ACCESS_TOKEN) {
    console.log('[SEND] ⚠️ 無 ACCESS_TOKEN');
    return;
  }

  try {
    await axios.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to: userId,
        messages: [{ type: 'text', text: message }]
      },
      {
        headers: {
          'Authorization': 'Bearer ' + LINE_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('[SEND] ✅ 訊息已發送');
  } catch (err) {
    console.error('[SEND] ❌ 發送失敗: ' + err.message);
  }
}

function generateToken(isLongLived = false) {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  return crypto.createHash('sha256').update(randomBytes + timestamp).digest('hex');
}

// ==================== 伺服器啟動 ====================

const PORT = 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('[SUCCESS] RemoteAI Guardian 已啟動');
  console.log('[INFO] 端口: ' + PORT);
  console.log('[INFO] 環境: ' + (process.env.NODE_ENV || 'production'));
  console.log('[READY] 準備接收 LINE 訊息和遠端指令\n');
});

server.on('error', (err) => {
  console.error('[ERROR] 伺服器啟動失敗: ' + err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('[SIGNAL] 收到 SIGTERM');
  server.close(() => process.exit(0));
});

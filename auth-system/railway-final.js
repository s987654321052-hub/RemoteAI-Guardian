#!/usr/bin/env node

/**
 * RemoteAI Guardian - 完整版
 * 支持 LINE 訊息接收和回覆
 * 已啟用 USER_ID 安全檢查
 */

require('dotenv').config();

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

console.log('[START] 應用初始化開始...');

const app = express();
app.use(express.json());
console.log('[INIT] Express 已加載');

// LINE 配置
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;

console.log('[CONFIG] LINE_ACCESS_TOKEN 前 20 字: ' + (LINE_ACCESS_TOKEN ? LINE_ACCESS_TOKEN.substring(0, 20) + '...' : '❌ 未設置'));
console.log('[CONFIG] LINE_USER_ID: ' + (LINE_USER_ID ? LINE_USER_ID : '❌ 未設置'));

// 認證系統狀態（簡單的內存存儲）
const pairedDevices = new Map();
const activeTokens = new Map();
const logs = [];

// 根路由
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    app: 'RemoteAI Guardian',
    version: '1.0.0'
  });
});

// 健康檢查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// ==================== LINE Webhook ====================
app.post('/webhook/line', async (req, res) => {
  // 立即返回 200
  res.status(200).send('OK');

  try {
    console.log('[WEBHOOK] LINE webhook 請求接收');

    if (!req.body || !req.body.events || req.body.events.length === 0) {
      console.log('[WEBHOOK] 無事件或空事件列表');
      return;
    }

    const { events } = req.body;
    console.log('[WEBHOOK] 事件數: ' + events.length);

    for (const event of events) {
      try {
        if (event.type === 'message' && event.message?.type === 'text') {
          const userId = event.source?.userId;
          const message = event.message.text;

          console.log('[MESSAGE] 用戶: ' + userId);
          console.log('[MESSAGE] 內容: ' + message);

          // ✅ 啟用 USER_ID 檢查
          if (userId !== LINE_USER_ID) {
            console.log('[AUTH] ⚠️ 未授權用戶，跳過');
            await sendLineMessage(userId, '❌ 你沒有權限使用此系統');
            continue;
          }

          console.log('[AUTH] ✅ 授權用戶');

          // 處理命令
          const reply = handleCommand(message);
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

// ==================== 認證 API ====================

// 配對請求
app.post('/api/pair/request', (req, res) => {
  try {
    const { deviceName } = req.body;
    
    if (!deviceName) {
      return res.status(400).json({ error: '缺少 deviceName' });
    }
    
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const pairingId = uuidv4();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    
    pairedDevices.set(pairingId, {
      code: pairingCode,
      deviceName: deviceName,
      status: 'PENDING',
      expiresAt: expiresAt,
      createdAt: new Date().toISOString()
    });
    
    console.log('[PAIR] 配對請求: ' + deviceName + ' (代碼: ' + pairingCode + ')');
    
    res.status(200).json({
      success: true,
      pairingId: pairingId,
      pairingCode: pairingCode,
      expiresIn: 600,
      message: '在 Windows 電腦上確認此代碼以完成配對'
    });
  } catch (err) {
    console.error('[PAIR_ERROR] ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

// 確認配對
app.post('/api/pair/confirm', async (req, res) => {
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
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });
    
    console.log('[PAIR] 配對已確認: ' + pairing.deviceName);
    
    await sendLineNotification(`✅ 新設備已配對\n📱 設備: ${pairing.deviceName}\n🔑 令牌有效期: 24 小時`);
    
    res.status(200).json({
      success: true,
      deviceToken: deviceToken,
      refreshToken: refreshToken,
      expiresIn: 86400,
      message: '配對成功！'
    });
  } catch (err) {
    console.error('[PAIR_ERROR] ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

// 驗證令牌
app.post('/api/auth/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '缺少或無效的授權令牌' });
    }
    
    const token = authHeader.slice(7);
    const tokenData = activeTokens.get(token);
    
    if (!tokenData) {
      return res.status(401).json({ error: '令牌無效或已過期' });
    }
    
    if (Date.now() > tokenData.expiresAt) {
      activeTokens.delete(token);
      return res.status(401).json({ error: '令牌已過期' });
    }
    
    const pairing = pairedDevices.get(tokenData.deviceId);
    
    res.status(200).json({
      success: true,
      isValid: true,
      deviceName: pairing.deviceName,
      expiresAt: tokenData.expiresAt
    });
  } catch (err) {
    console.error('[AUTH_ERROR] ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

// 獲取設備列表
app.get('/api/devices', (req, res) => {
  try {
    const devices = Array.from(pairedDevices.values()).map(p => ({
      deviceName: p.deviceName,
      status: p.status,
      confirmedAt: p.confirmedAt,
      hasActiveToken: !!p.deviceToken && activeTokens.has(p.deviceToken)
    }));

    res.status(200).json({
      success: true,
      devices: devices,
      total: devices.length
    });
  } catch (err) {
    console.error('[DEVICES_ERROR] ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

// 系統狀態
app.get('/api/status', (req, res) => {
  try {
    res.status(200).json({
      status: 'running',
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0',
      pairedDevices: pairedDevices.size,
      activeTokens: activeTokens.size,
      lineConfigured: !!LINE_ACCESS_TOKEN && !!LINE_USER_ID,
      startedAt: new Date()
    });
  } catch (err) {
    console.error('[STATUS_ERROR] ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

// 日誌
app.get('/api/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    res.status(200).json(logs.slice(-limit));
  } catch (err) {
    console.error('[LOGS_ERROR] ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==================== 輔助函數 ====================

// 處理命令
function handleCommand(message) {
  const cmd = message.trim().toLowerCase();
  
  switch (cmd) {
    case 'help':
    case '幫助':
      return `📚 RemoteAI Guardian 命令\n\n可用命令:\n• help - 幫助\n• ping - 測試\n• status - 狀態\n• time - 時間\n• info - 信息\n• devices - 已配對設備\n• pair - 開始配對`;
    
    case 'ping':
      return '🏓 Pong! ✅';
    
    case 'status':
    case '狀態':
      return '✅ 系統運行中\n⏰ ' + new Date().toLocaleString('zh-TW') + '\n📱 設備數: ' + pairedDevices.size;
    
    case 'time':
      return '⏰ ' + new Date().toLocaleString('zh-TW');
    
    case 'info':
      return 'ℹ️ RemoteAI Guardian v1.0.0\n🚀 Railway 部署\n✅ LINE 已連接\n🔐 安全認證已啟用';
    
    case 'devices':
      const deviceList = Array.from(pairedDevices.values())
        .map((d, i) => `${i+1}. ${d.deviceName} (${d.status})`)
        .join('\n') || '無已配對設備';
      return `📱 已配對設備:\n${deviceList}`;
    
    case 'pair':
      return '🔐 配對步驟:\n1. 調用 /api/pair/request\n2. 獲取配對碼\n3. 調用 /api/pair/confirm\n4. 完成配對';
    
    default:
      return '❌ 未知命令: ' + message + '\n\n試試 "help" 查看幫助';
  }
}

// 發送 LINE 訊息
async function sendLineMessage(userId, message) {
  if (!LINE_ACCESS_TOKEN) {
    console.log('[SEND] ⚠️ 無 ACCESS_TOKEN，無法發送');
    return;
  }

  try {
    console.log('[SEND] 正在發送訊息...');
    
    const response = await axios.post(
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

// 發送 LINE 通知
async function sendLineNotification(message) {
  if (!LINE_ACCESS_TOKEN || !LINE_USER_ID) {
    console.log('[NOTIFY] ⚠️ LINE 未配置');
    return;
  }

  try {
    await sendLineMessage(LINE_USER_ID, message);
    console.log('[NOTIFY] ✅ 通知已發送');
  } catch (err) {
    console.log('[NOTIFY] ⚠️ 通知發送失敗: ' + err.message);
  }
}

// 生成令牌
function generateToken(isLongLived = false) {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const token = crypto.createHash('sha256').update(randomBytes + timestamp).digest('hex');
  return token;
}

// 記錄事件
function logEvent(eventType, message, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType: eventType,
    message: message,
    details: details
  };
  
  logs.push(logEntry);
  console.log(`[${eventType}] ${message}`);
}

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// ==================== 伺服器啟動 ====================

const PORT = 3000;
console.log('[CONFIG] 端口: ' + PORT);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('[SUCCESS] 伺服器已啟動');
  console.log('[INFO] 監聽 0.0.0.0:' + PORT);
  console.log('[INFO] 環境：' + (process.env.NODE_ENV || 'production'));
  console.log('[READY] 準備接收 LINE 訊息\n');
});

server.on('error', (err) => {
  console.error('[ERROR] 伺服器啟動失敗: ' + err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('[SIGNAL] 收到 SIGTERM，關閉伺服器');
  server.close(() => process.exit(0));
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] 未捕獲異常: ' + err.message);
  process.exit(1);
});

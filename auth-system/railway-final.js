#!/usr/bin/env node

/**
 * RemoteAI Guardian - 完整版
 * 支持 LINE 訊息接收和回覆
 */

require('dotenv').config();

const express = require('express');
const axios = require('axios');

console.log('[START] 應用初始化開始...');

const app = express();
app.use(express.json());
console.log('[INIT] Express 已加載');

// LINE 配置
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;

console.log('[CONFIG] LINE_ACCESS_TOKEN 前 20 字: ' + (LINE_ACCESS_TOKEN ? LINE_ACCESS_TOKEN.substring(0, 20) + '...' : '❌ 未設置'));
console.log('[CONFIG] LINE_USER_ID: ' + (LINE_USER_ID ? LINE_USER_ID : '❌ 未設置'));

// 根路由
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', app: 'RemoteAI Guardian' });
});

// 健康檢查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Webhook
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
        console.log('[EVENT] 類型: ' + event.type);
        
        if (event.type === 'message' && event.message?.type === 'text') {
          const userId = event.source?.userId;
          const message = event.message.text;

          console.log('\n========================================');
          console.log('[MESSAGE] 用戶 ID: ' + userId);
          console.log('[MESSAGE] 訊息內容: ' + message);
          console.log('[MESSAGE] 設置的 USER_ID: ' + (LINE_USER_ID || '未設置'));
          console.log('========================================\n');

          // 暫時註釋掉 USER_ID 檢查，允許所有訊息回覆（用於調試）
          // if (userId !== LINE_USER_ID) {
          //   console.log('[AUTH] ⚠️ 未授權用戶，跳過');
          //   continue;
          // }

          const reply = handleCommand(message);
          console.log('[REPLY] 準備發送: ' + reply.substring(0, 50));
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

// API 狀態
app.get('/api/status', (req, res) => {
  res.status(200).json({ 
    status: 'running', 
    time: new Date().toISOString(),
    lineConfigured: !!LINE_ACCESS_TOKEN && !!LINE_USER_ID
  });
});

// 處理命令
function handleCommand(message) {
  const cmd = message.trim().toLowerCase();
  
  switch (cmd) {
    case 'help':
    case '幫助':
      return `📚 RemoteAI Guardian 命令\n\n可用命令:\n• help - 幫助\n• ping - 測試\n• status - 狀態\n• time - 時間\n• info - 信息`;
    
    case 'ping':
      return '🏓 Pong! ✅';
    
    case 'status':
    case '狀態':
      return '✅ 系統運行中\n⏰ ' + new Date().toLocaleString('zh-TW');
    
    case 'time':
      return '⏰ ' + new Date().toLocaleString('zh-TW');
    
    case 'info':
      return 'ℹ️ RemoteAI Guardian v1.0.0\n🚀 Railway 部署\n✅ LINE 已連接';
    
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
    console.log('[SEND] 正在發送訊息到 ' + userId);
    
    // 嘗試用 api.line.me 而不是 api.line.biz
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

    console.log('[SEND] ✅ 訊息已發送 (HTTP ' + response.status + ')');
  } catch (err) {
    console.error('[SEND] ❌ 發送失敗: ' + err.message);
    
    // 如果 api.line.me 失敗，試試 api.line.biz
    if (err.message.includes('ENOTFOUND')) {
      console.log('[SEND] 正在嘗試備用端點...');
      try {
        const response2 = await axios.post(
          'https://api.line.biz/v3/bot/message/push',
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
        console.log('[SEND] ✅ 備用端點成功 (HTTP ' + response2.status + ')');
      } catch (err2) {
        console.error('[SEND] 備用端點也失敗: ' + err2.message);
      }
    }
    
    if (err.response?.data) {
      console.error('[SEND] 詳細: ' + JSON.stringify(err.response.data));
    }
  }
}

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// 強制使用 3000
const PORT = 3000;
console.log('[CONFIG] 端口: ' + PORT + ' (硬寫死)');

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

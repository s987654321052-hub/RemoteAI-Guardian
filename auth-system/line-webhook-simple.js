/**
 * RemoteAI Guardian - 簡化版 LINE Webhook
 * 在 Railway 中運行（不支持 child_process）
 */

const express = require('express');
const axios = require('axios');
require('dotenv').config();

class SimpleLineWebhook {
  constructor() {
    this.app = express();
    this.app.use(express.json());
    
    this.lineAccessToken = process.env.LINE_ACCESS_TOKEN;
    this.lineUserId = process.env.LINE_USER_ID;
    
    console.log('\n📋 LINE 配置檢查:');
    console.log(`✅ Access Token: ${this.lineAccessToken ? '已設置' : '❌ 未設置'}`);
    console.log(`✅ User ID: ${this.lineUserId ? this.lineUserId : '❌ 未設置'}\n`);
    
    this.setupRoutes();
  }

  async sendLineMessage(userId, message) {
    try {
      if (!this.lineAccessToken) {
        console.log('⚠️ 無法發送 LINE 訊息：Access Token 未設置');
        return false;
      }

      const payload = {
        to: userId,
        messages: [{
          type: 'text',
          text: message
        }]
      };

      console.log(`📤 發送訊息到 ${userId}...`);
      
      const response = await axios.post(
        'https://api.line.biz/v3/bot/message/push',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.lineAccessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log(`✅ LINE 訊息已發送 (${response.status})`);
      return true;
    } catch (error) {
      console.error(`❌ 發送失敗:`, error.response?.data || error.message);
      return false;
    }
  }

  async handleCommand(userId, message) {
    console.log(`\n📨 收到命令: "${message}" (用戶: ${userId})`);
    
    const command = message.trim().toLowerCase();
    let response = '';

    switch (command) {
      case 'help':
      case '幫助':
        response = `📚 RemoteAI Guardian - 命令幫助

可用命令:
• help / 幫助 - 顯示此幫助
• status / 狀態 - 檢查系統狀態
• ping - 測試連接
• time - 顯示當前時間
• info - 查看應用信息

💡 例如: ping`;
        break;

      case 'status':
      case '狀態':
        response = `✅ 系統狀態

🖥️ 狀態: 運行中（Railway）
⏰ 時間: ${new Date().toLocaleString('zh-TW')}
🚀 版本: 1.0.0
📍 環境: 雲端部署`;
        break;

      case 'ping':
        response = `🏓 Pong! 連接正常 ✅`;
        break;

      case 'time':
        response = `⏰ 當前時間: ${new Date().toLocaleString('zh-TW')}`;
        break;

      case 'info':
        response = `ℹ️ RemoteAI Guardian v1.0.0

📍 部署平台: Railway
🌐 協議: HTTPS
✅ 狀態: 運行中

本地測試: 
  node test-webhook-local.js

遠程監控:
  可通過此 LINE Bot 進行遠程監控`;
        break;

      default:
        response = `❌ 未知命令: ${message}\n\n輸入 "help" 查看幫助`;
    }

    await this.sendLineMessage(userId, response);
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    this.app.post('/webhook/line', async (req, res) => {
      console.log('\n📥 Webhook 請求接收');

      try {
        if (!req.body || !req.body.events || req.body.events.length === 0) {
          console.log('✅ LINE 驗證請求 - 返回 200 OK');
          return res.status(200).json({ ok: true });
        }

        const { events } = req.body;

        for (const event of events) {
          if (event.type === 'message' && event.message?.type === 'text') {
            const userId = event.source?.userId;
            const message = event.message.text;

            console.log(`👤 用戶 ID: ${userId}`);
            console.log(`💬 訊息: ${message}`);

            if (userId === this.lineUserId) {
              await this.handleCommand(userId, message);
            } else {
              console.log(`⚠️ 未授權用戶`);
              await this.sendLineMessage(userId, '❌ 你沒有權限使用此系統');
            }
          }
        }

        res.status(200).json({ ok: true });
      } catch (error) {
        console.error('❌ Webhook 錯誤:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/', (req, res) => {
      res.json({ 
        name: 'RemoteAI Guardian',
        version: '1.0.0',
        status: 'running',
        platform: 'Railway'
      });
    });
  }

  start(port = 3001) {
    this.app.listen(port, '0.0.0.0', () => {
      console.log(`\n🚀 RemoteAI Guardian LINE Webhook 已啟動`);
      console.log(`📍 Webhook URL: https://your-app.up.railway.app/webhook/line`);
      console.log(`❤️  健康檢查: https://your-app.up.railway.app/health\n`);

      if (this.lineUserId) {
        setTimeout(() => {
          this.sendLineMessage(this.lineUserId, '✅ RemoteAI Guardian 已啟動！\n\n試試發送 "help" 命令');
        }, 2000);
      }
    });
  }
}

if (require.main === module) {
  const webhook = new SimpleLineWebhook();
  const port = process.env.PORT || process.env.LINE_WEBHOOK_PORT || 3001;
  webhook.start(port);
}

module.exports = SimpleLineWebhook;

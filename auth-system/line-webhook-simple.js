/**
 * RemoteAI Guardian - 簡化版 LINE Webhook
 * 用於測試和調試，跳過簽名驗證
 */

const express = require('express');
const axios = require('axios');
require('dotenv').config();

class SimpleLineWebhook {
  constructor() {
    this.app = express();
    
    // 使用 express.json() - 自動解析 JSON
    this.app.use(express.json());
    
    this.lineAccessToken = process.env.LINE_ACCESS_TOKEN;
    this.lineUserId = process.env.LINE_USER_ID;
    
    console.log('\n📋 LINE 配置檢查:');
    console.log(`✅ Access Token: ${this.lineAccessToken ? '已設置' : '❌ 未設置'}`);
    console.log(`✅ User ID: ${this.lineUserId ? this.lineUserId : '❌ 未設置'}\n`);
    
    this.setupRoutes();
  }

  /**
   * 發送 LINE 訊息
   */
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

  /**
   * 處理命令
   */
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
• run <命令> - 執行任意命令

💡 例如: run dir`;
        break;

      case 'status':
      case '狀態':
        response = `✅ 系統狀態

🖥️ 狀態: 運行中
⏰ 時間: ${new Date().toLocaleString('zh-TW')}
📍 Tailscale IP: 100.127.44.67
🔧 版本: 1.0.0`;
        break;

      case 'ping':
        response = `🏓 Pong! 連接正常`;
        break;

      case 'time':
        response = `⏰ 當前時間: ${new Date().toLocaleString('zh-TW')}`;
        break;

      default:
        if (command.startsWith('run ')) {
          const cmd = message.substring(4);
          response = await this.executeCommand(cmd);
        } else {
          response = `❌ 未知命令: ${message}\n\n輸入 "help" 查看幫助`;
        }
    }

    // 發送回應
    await this.sendLineMessage(userId, response);
  }

  /**
   * 執行 Windows 命令
   */
  async executeCommand(command) {
    try {
      const { execSync } = require('child_process');
      
      console.log(`🚀 執行命令: ${command}`);
      
      const output = execSync(command, {
        encoding: 'utf-8',
        timeout: 30000,
        maxBuffer: 5 * 1024 * 1024
      });

      const truncated = output.length > 800 
        ? output.substring(0, 800) + '\n... (輸出已截斷)'
        : output;

      return `✅ 命令執行成功\n\n\`\`\`\n${truncated}\n\`\`\``;
    } catch (error) {
      return `❌ 命令執行失敗\n\n錯誤: ${error.message}`;
    }
  }

  /**
   * 配置路由
   */
  setupRoutes() {
    /**
     * 健康檢查
     */
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    /**
     * LINE Webhook - 接收並處理訊息
     */
    this.app.post('/webhook/line', async (req, res) => {
      console.log('\n📥 Webhook 請求接收');
      console.log(`Headers:`, req.headers);
      console.log(`Body:`, JSON.stringify(req.body, null, 2));

      try {
        // 簡單檢查：如果沒有 events，說明這是 LINE 的驗證請求
        if (!req.body || !req.body.events || req.body.events.length === 0) {
          console.log('✅ 這是 LINE 驗證請求 - 返回 200 OK');
          return res.status(200).json({ ok: true });
        }

        // 處理實際的訊息事件
        const { events } = req.body;

        for (const event of events) {
          console.log(`\n事件類型: ${event.type}`);
          
          if (event.type === 'message' && event.message?.type === 'text') {
            const userId = event.source?.userId;
            const message = event.message.text;

            console.log(`👤 用戶 ID: ${userId}`);
            console.log(`💬 訊息內容: ${message}`);

            // 檢查用戶權限
            if (userId === this.lineUserId) {
              await this.handleCommand(userId, message);
            } else {
              console.log(`⚠️ 未授權用戶，拒絕訪問`);
              await this.sendLineMessage(userId, '❌ 你沒有權限使用此系統');
            }
          } else if (event.type === 'follow') {
            console.log('👋 用戶已關注');
          }
        }

        res.status(200).json({ ok: true });
      } catch (error) {
        console.error('❌ Webhook 處理錯誤:', error);
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * 測試端點 - 手動觸發命令
     */
    this.app.get('/test', async (req, res) => {
      const message = req.query.message || 'help';
      console.log(`\n🧪 測試模式: ${message}`);
      
      await this.handleCommand(this.lineUserId, message);
      res.json({ ok: true, message: `已發送測試訊息: ${message}` });
    });
  }

  /**
   * 啟動伺服器
   */
  start(port = 3001) {
    this.app.listen(port, '0.0.0.0', () => {
      console.log(`\n🚀 簡化版 LINE Webhook 已啟動`);
      console.log(`📍 本地 Webhook: http://localhost:${port}/webhook/line`);
      console.log(`🌐 遠程 Webhook: http://100.127.44.67:${port}/webhook/line`);
      console.log(`🧪 測試端點: http://localhost:${port}/test?message=status`);
      console.log(`❤️  健康檢查: http://localhost:${port}/health\n`);

      // 自動發送初始化訊息
      if (this.lineUserId) {
        setTimeout(() => {
          this.sendLineMessage(this.lineUserId, '✅ RemoteAI Guardian 已啟動！\n\n現在可以開始使用。試試發送 "help" 命令');
        }, 2000);
      }
    });
  }
}

// 啟動
if (require.main === module) {
  const webhook = new SimpleLineWebhook();
  const port = process.env.LINE_WEBHOOK_PORT || 3001;
  webhook.start(port);
}

module.exports = SimpleLineWebhook;

#!/usr/bin/env node

/**
 * RemoteAI Guardian - Railway 部署啟動腳本 (改進版)
 * 添加更好的錯誤處理和日誌
 */

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class RailwayAppStarter {
  constructor() {
    this.app = express();
    this.app.use(express.json());
    
    // 認證系統狀態
    this.pairedDevices = new Map();
    this.activeTokens = new Map();
    this.logs = [];
    
    // LINE 配置
    this.lineAccessToken = process.env.LINE_ACCESS_TOKEN;
    this.lineUserId = process.env.LINE_USER_ID;
    
    this.setupAuthRoutes();
    this.setupWebhookRoutes();
    this.setupHealthRoutes();
    this.setupErrorHandling();
  }

  /**
   * 錯誤處理
   */
  setupErrorHandling() {
    // 處理未捕獲的異常
    process.on('uncaughtException', (error) => {
      console.error('❌ 未捕獲的異常:', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ 未處理的 Promise 拒絕:', reason);
    });

    // Express 錯誤中間件
    this.app.use((err, req, res, next) => {
      console.error('❌ Express 錯誤:', err);
      res.status(500).json({ error: err.message });
    });
  }

  /**
   * 認證系統路由
   */
  setupAuthRoutes() {
    // 配對請求
    this.app.post('/api/pair/request', (req, res) => {
      try {
        const { deviceName } = req.body;
        
        if (!deviceName) {
          return res.status(400).json({ error: '缺少 deviceName' });
        }
        
        const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
        const pairingId = uuidv4();
        const expiresAt = Date.now() + 10 * 60 * 1000;
        
        this.pairedDevices.set(pairingId, {
          code: pairingCode,
          deviceName: deviceName,
          status: 'PENDING',
          expiresAt: expiresAt,
          createdAt: new Date().toISOString()
        });
        
        this.log('PAIR_REQUEST', `設備請求配對: ${deviceName}`);
        
        res.status(200).json({
          success: true,
          pairingId: pairingId,
          pairingCode: pairingCode,
          expiresIn: 600,
          message: '在 Windows 電腦上確認此代碼以完成配對'
        });
      } catch (error) {
        console.error('❌ 配對請求錯誤:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 確認配對
    this.app.post('/api/pair/confirm', async (req, res) => {
      try {
        const { pairingId, pairingCode, deviceUUID } = req.body;
        
        const pairing = this.pairedDevices.get(pairingId);
        
        if (!pairing) {
          return res.status(404).json({ error: '配對請求不存在' });
        }
        
        if (Date.now() > pairing.expiresAt) {
          this.pairedDevices.delete(pairingId);
          return res.status(400).json({ error: '配對碼已過期' });
        }
        
        if (pairing.code !== pairingCode) {
          return res.status(400).json({ error: '配對碼不正確' });
        }
        
        const deviceToken = this.generateToken();
        const refreshToken = this.generateToken(true);
        
        pairing.status = 'CONFIRMED';
        pairing.deviceUUID = deviceUUID;
        pairing.deviceToken = deviceToken;
        pairing.refreshToken = refreshToken;
        pairing.confirmedAt = new Date().toISOString();
        
        this.activeTokens.set(deviceToken, {
          deviceId: pairingId,
          deviceUUID: deviceUUID,
          createdAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000
        });
        
        this.log('PAIR_CONFIRMED', `設備配對已確認: ${pairing.deviceName}`);
        
        await this.sendLineNotification(`✅ 新設備已配對\n\n📱 設備: ${pairing.deviceName}\n🔑 令牌有效期: 24 小時`);
        
        res.status(200).json({
          success: true,
          deviceToken: deviceToken,
          refreshToken: refreshToken,
          expiresIn: 86400,
          message: '配對成功！'
        });
      } catch (error) {
        console.error('❌ 確認配對錯誤:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 驗證令牌
    this.app.post('/api/auth/verify', (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: '缺少或無效的授權令牌' });
        }
        
        const token = authHeader.slice(7);
        const tokenData = this.activeTokens.get(token);
        
        if (!tokenData) {
          return res.status(401).json({ error: '令牌無效或已過期' });
        }
        
        if (Date.now() > tokenData.expiresAt) {
          this.activeTokens.delete(token);
          return res.status(401).json({ error: '令牌已過期' });
        }
        
        const pairing = this.pairedDevices.get(tokenData.deviceId);
        
        res.status(200).json({
          success: true,
          isValid: true,
          deviceName: pairing.deviceName,
          expiresAt: tokenData.expiresAt
        });
      } catch (error) {
        console.error('❌ 驗證令牌錯誤:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 獲取設備列表
    this.app.get('/api/devices', (req, res) => {
      try {
        const devices = Array.from(this.pairedDevices.values()).map(p => ({
          deviceName: p.deviceName,
          status: p.status,
          confirmedAt: p.confirmedAt,
          hasActiveToken: !!p.deviceToken && this.activeTokens.has(p.deviceToken)
        }));

        res.status(200).json({
          success: true,
          devices: devices,
          total: devices.length
        });
      } catch (error) {
        console.error('❌ 獲取設備列表錯誤:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 系統狀態
    this.app.get('/api/status', (req, res) => {
      try {
        res.status(200).json({
          status: 'running',
          environment: process.env.NODE_ENV || 'production',
          platform: process.env.RAILWAY_ENVIRONMENT_NAME || 'local',
          pairedDevices: this.pairedDevices.size,
          activeTokens: this.activeTokens.size,
          startedAt: new Date()
        });
      } catch (error) {
        console.error('❌ 系統狀態錯誤:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 日誌
    this.app.get('/api/logs', (req, res) => {
      try {
        const limit = req.query.limit || 50;
        res.status(200).json(this.logs.slice(-limit));
      } catch (error) {
        console.error('❌ 獲取日誌錯誤:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * LINE Webhook 路由
   */
  setupWebhookRoutes() {
    this.app.post('/webhook/line', async (req, res) => {
      console.log('\n📥 Webhook 請求接收');
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      try {
        // LINE 平台驗證 webhook - 必須立即返回 200
        if (!req.body || !req.body.events) {
          console.log('✅ 驗證請求 - 返回 200');
          return res.status(200).send('OK');
        }

        const { events } = req.body;

        if (!events || events.length === 0) {
          console.log('✅ 空事件列表 - 返回 200');
          return res.status(200).send('OK');
        }

        // 立即返回 200 給 LINE，然後非同步處理事件
        res.status(200).send('OK');

        // 非同步處理事件（不阻塞回應）
        for (const event of events) {
          try {
            if (event.type === 'message' && event.message?.type === 'text') {
              const userId = event.source?.userId;
              const message = event.message.text;

              console.log(`👤 用戶: ${userId}`);
              console.log(`💬 訊息: ${message}`);

              if (userId === this.lineUserId) {
                await this.handleLineCommand(userId, message);
              } else {
                console.log(`⚠️ 未授權用戶`);
                await this.sendLineMessage(userId, '❌ 你沒有權限使用此系統');
              }
            }
          } catch (eventError) {
            console.error('❌ 處理事件錯誤:', eventError);
          }
        }
      } catch (error) {
        console.error('❌ Webhook 錯誤:', error);
        // 即使出錯也要返回 200，否則 LINE 會重試
        res.status(200).send('OK');
      }
    });
  }

  /**
   * 健康檢查和根路由
   */
  setupHealthRoutes() {
    this.app.get('/health', (req, res) => {
      try {
        res.status(200).json({ 
          status: 'ok',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'production'
        });
      } catch (error) {
        console.error('❌ 健康檢查錯誤:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/', (req, res) => {
      try {
        res.status(200).json({ 
          name: 'RemoteAI Guardian',
          version: '1.0.0',
          status: 'running',
          environment: process.env.NODE_ENV || 'production',
          platform: process.env.RAILWAY_ENVIRONMENT_NAME || 'local',
          uptime: process.uptime()
        });
      } catch (error) {
        console.error('❌ 根路由錯誤:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 404 處理
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  /**
   * 處理 LINE 命令
   */
  async handleLineCommand(userId, message) {
    try {
      const command = message.trim().toLowerCase();
      let response = '';

      switch (command) {
        case 'help':
        case '幫助':
          response = `📚 RemoteAI Guardian - 命令幫助\n\n可用命令:\n• help / 幫助\n• status / 狀態\n• ping\n• time\n• info`;
          break;

        case 'status':
        case '狀態':
          response = `✅ 系統狀態\n\n🖥️ 狀態: 運行中\n⏰ 時間: ${new Date().toLocaleString('zh-TW')}\n🚀 版本: 1.0.0`;
          break;

        case 'ping':
          response = `🏓 Pong! 連接正常 ✅`;
          break;

        case 'time':
          response = `⏰ 當前時間: ${new Date().toLocaleString('zh-TW')}`;
          break;

        case 'info':
          response = `ℹ️ RemoteAI Guardian v1.0.0\n\n📍 部署平台: ${process.env.RAILWAY_ENVIRONMENT_NAME || 'Local'}\n✅ 狀態: 運行中`;
          break;

        default:
          response = `❌ 未知命令: ${message}\n\n輸入 "help" 查看幫助`;
      }

      await this.sendLineMessage(userId, response);
    } catch (error) {
      console.error('❌ 處理命令錯誤:', error);
    }
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

      await axios.post(
        'https://api.line.biz/v3/bot/message/push',
        {
          to: userId,
          messages: [{ type: 'text', text: message }]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.lineAccessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log(`✅ LINE 訊息已發送`);
      return true;
    } catch (error) {
      console.error(`❌ 發送失敗:`, error.response?.data || error.message);
      return false;
    }
  }

  /**
   * 發送 LINE 通知
   */
  async sendLineNotification(message) {
    if (!this.lineAccessToken || !this.lineUserId) {
      console.log('⚠️ LINE 通知未配置');
      return;
    }

    try {
      await axios.post('https://api.line.biz/v3/bot/message/push', {
        to: this.lineUserId,
        messages: [{ type: 'text', text: message }]
      }, {
        headers: {
          'Authorization': `Bearer ${this.lineAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ LINE 通知已發送');
    } catch (error) {
      console.log('⚠️ LINE 通知發送失敗:', error.message);
    }
  }

  /**
   * 生成令牌
   */
  generateToken(isLongLived = false) {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now().toString();
    const token = crypto.createHash('sha256').update(randomBytes + timestamp).digest('hex');
    return token;
  }

  /**
   * 記錄事件
   */
  log(eventType, message, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: eventType,
      message: message,
      details: details
    };
    
    this.logs.push(logEntry);
    console.log(`[${eventType}] ${message}`);
  }

  /**
   * 啟動伺服器
   */
  start(port = 3000) {
    try {
      const server = this.app.listen(port, '0.0.0.0', () => {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║ 🚀 RemoteAI Guardian 應用啟動');
        console.log('╚════════════════════════════════════════╝\n');
        
        console.log(`📝 環境: ${process.env.NODE_ENV || 'production'}`);
        console.log(`🚀 平台: ${process.env.RAILWAY_ENVIRONMENT_NAME || 'Local'}`);
        console.log(`🔑 監聽端口: ${port}`);
        console.log(`📌 機器: ${process.env.HOSTNAME || 'unknown'}\n`);
        
        console.log('📍 API 端點:');
        console.log(`   • 配對: http://localhost:${port}/api/pair/request`);
        console.log(`   • 驗證: http://localhost:${port}/api/auth/verify`);
        console.log(`   • 設備: http://localhost:${port}/api/devices`);
        console.log(`   • 狀態: http://localhost:${port}/api/status`);
        console.log(`   • Webhook: http://localhost:${port}/webhook/line`);
        console.log(`   • 健康檢查: http://localhost:${port}/health\n`);

        if (this.lineAccessToken && this.lineUserId) {
          console.log('✅ LINE 通知已啟用\n');
          this.sendLineNotification('✅ RemoteAI Guardian 已在 Railway 上啟動！');
        } else {
          console.log('⚠️ LINE 通知未配置（可選）\n');
        }
      });

      // 處理伺服器錯誤
      server.on('error', (err) => {
        console.error('❌ 伺服器錯誤:', err);
        process.exit(1);
      });
    } catch (error) {
      console.error('❌ 啟動失敗:', error);
      process.exit(1);
    }
  }
}

// 啟動應用
if (require.main === module) {
  try {
    const port = process.env.PORT || 3000;
    console.log(`🚀 使用端口: ${port}`);
    console.log(`📝 NODE_ENV: ${process.env.NODE_ENV}`);
    
    const app = new RailwayAppStarter();
    app.start(port);
  } catch (error) {
    console.error('❌ 初始化失敗:', error);
    process.exit(1);
  }
}

module.exports = RailwayAppStarter;

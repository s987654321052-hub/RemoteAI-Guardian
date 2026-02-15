/**
 * RemoteAI Guardian - 認證系統（簡化版）
 * 蘋果手機認證 + 令牌管理 + LINE 通知
 */

const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
require('dotenv').config();

class AuthenticationSystem {
  constructor() {
    this.app = express();
    this.app.use(express.json());
    
    // 存儲已配對的設備
    this.pairedDevices = new Map();
    
    // 存儲活躍令牌
    this.activeTokens = new Map();
    
    // 初始化日誌
    this.logs = [];
    
    // LINE 通知
    this.lineAccessToken = process.env.LINE_ACCESS_TOKEN;
    this.lineUserId = process.env.LINE_USER_ID;
    
    this.setupRoutes();
  }

  /**
   * 發送 LINE 通知
   */
  async sendLineNotification(message) {
    if (!this.lineAccessToken || !this.lineUserId) {
      console.log('⚠️ LINE 通知未配置，跳過');
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
   * 配置路由
   */
  setupRoutes() {
    /**
     * 步驟 1: iPhone 請求配對
     * POST /api/pair/request
     * Body: { deviceName: "User's iPhone" }
     * Return: { pairingCode, expiresIn }
     */
    this.app.post('/api/pair/request', (req, res) => {
      const { deviceName } = req.body;
      
      if (!deviceName) {
        return res.status(400).json({ error: '缺少 deviceName' });
      }
      
      // 生成配對碼（6 位數字）
      const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
      const pairingId = uuidv4();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 分鐘有效
      
      // 存儲配對請求
      this.pairedDevices.set(pairingId, {
        code: pairingCode,
        deviceName: deviceName,
        status: 'PENDING',
        expiresAt: expiresAt,
        createdAt: new Date().toISOString()
      });
      
      this.log('PAIR_REQUEST', `設備請求配對: ${deviceName}`, { pairingCode });
      
      res.json({
        success: true,
        pairingId: pairingId,
        pairingCode: pairingCode,
        expiresIn: 600, // 秒
        message: '在 Windows 電腦上確認此代碼以完成配對'
      });
    });

    /**
     * 步驟 2: Windows 確認配對
     * POST /api/pair/confirm
     * Body: { pairingId, pairingCode, deviceUUID }
     * Return: { deviceToken, refreshToken }
     */
    this.app.post('/api/pair/confirm', async (req, res) => {
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
      
      // 生成設備令牌
      const deviceToken = this.generateToken();
      const refreshToken = this.generateToken(true);
      
      // 更新配對狀態
      pairing.status = 'CONFIRMED';
      pairing.deviceUUID = deviceUUID;
      pairing.deviceToken = deviceToken;
      pairing.refreshToken = refreshToken;
      pairing.confirmedAt = new Date().toISOString();
      
      // 存儲活躍令牌
      this.activeTokens.set(deviceToken, {
        deviceId: pairingId,
        deviceUUID: deviceUUID,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 小時
      });
      
      this.log('PAIR_CONFIRMED', `設備配對已確認: ${pairing.deviceName}`, { deviceUUID });
      
      // 發送 LINE 通知
      await this.sendLineNotification(`✅ 新設備已配對\n\n📱 設備: ${pairing.deviceName}\n🔑 令牌有效期: 24 小時\n⏰ 時間: ${new Date().toLocaleString('zh-TW')}`);
      
      res.json({
        success: true,
        deviceToken: deviceToken,
        refreshToken: refreshToken,
        expiresIn: 86400, // 24 小時
        message: '配對成功！'
      });
    });

    /**
     * 步驟 3: iPhone 使用令牌進行身份驗證
     * POST /api/auth/verify
     * Header: Authorization: Bearer {deviceToken}
     * Return: { isValid, deviceName }
     */
    this.app.post('/api/auth/verify', (req, res) => {
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
      
      res.json({
        success: true,
        isValid: true,
        deviceName: pairing.deviceName,
        expiresAt: tokenData.expiresAt
      });
    });

    /**
     * 步驟 4: 刷新令牌
     * POST /api/auth/refresh
     * Body: { refreshToken }
     * Return: { newDeviceToken }
     */
    this.app.post('/api/auth/refresh', async (req, res) => {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ error: '缺少 refreshToken' });
      }
      
      // 驗證刷新令牌
      let deviceId = null;
      for (const [id, pairing] of this.pairedDevices.entries()) {
        if (pairing.refreshToken === refreshToken) {
          deviceId = id;
          break;
        }
      }
      
      if (!deviceId) {
        return res.status(401).json({ error: '無效的刷新令牌' });
      }
      
      // 生成新令牌
      const newToken = this.generateToken();
      const pairing = this.pairedDevices.get(deviceId);
      
      this.activeTokens.set(newToken, {
        deviceId: deviceId,
        deviceUUID: pairing.deviceUUID,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });
      
      this.log('TOKEN_REFRESHED', `令牌已刷新: ${pairing.deviceName}`);
      
      // 發送 LINE 通知
      await this.sendLineNotification(`🔄 令牌已刷新\n\n📱 設備: ${pairing.deviceName}\n⏰ 時間: ${new Date().toLocaleString('zh-TW')}`);
      
      res.json({
        success: true,
        deviceToken: newToken,
        expiresIn: 86400
      });
    });

    /**
     * 獲取所有配對設備
     * GET /api/devices
     */
    this.app.get('/api/devices', (req, res) => {
      const devices = Array.from(this.pairedDevices.values()).map(p => ({
        deviceName: p.deviceName,
        status: p.status,
        confirmedAt: p.confirmedAt,
        hasActiveToken: !!p.deviceToken && this.activeTokens.has(p.deviceToken)
      }));

      res.json({
        success: true,
        devices: devices,
        total: devices.length
      });
    });

    /**
     * 狀態端點
     */
    this.app.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        pairedDevices: this.pairedDevices.size,
        activeTokens: this.activeTokens.size,
        startedAt: new Date()
      });
    });

    /**
     * 日誌端點
     */
    this.app.get('/api/logs', (req, res) => {
      const limit = req.query.limit || 50;
      res.json(this.logs.slice(-limit));
    });

    /**
     * 健康檢查
     */
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
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
  start(port = 8888) {
    this.app.listen(port, '0.0.0.0', () => {
      console.log('\n🚀 認證系統已啟動（簡化版）');
      console.log(`📱 蘋果配對端點: http://localhost:${port}/api/pair/request`);
      console.log(`🔐 認證驗證端點: http://localhost:${port}/api/auth/verify`);
      console.log(`🔄 令牌刷新端點: http://localhost:${port}/api/auth/refresh`);
      console.log(`📋 設備列表: http://localhost:${port}/api/devices`);
      console.log(`📊 狀態端點: http://localhost:${port}/api/status`);
      console.log(`📋 日誌端點: http://localhost:${port}/api/logs\n`);
      
      if (process.env.LINE_USER_ID) {
        console.log('✅ LINE 通知已啟用\n');
      } else {
        console.log('⚠️ LINE 通知未配置（可選）\n');
      }
    });
  }
}

// 啟動系統
const authSystem = new AuthenticationSystem();
const port = process.env.AUTH_PORT || 8888;
authSystem.start(port);

module.exports = authSystem;

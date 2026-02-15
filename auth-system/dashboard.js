/**
 * RemoteAI Guardian - 儀表板伺服器
 * 提供 Web UI 和靜態資源
 */

const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

class DashboardServer {
  constructor() {
    this.app = express();
    this.port = process.env.DASHBOARD_PORT || 9999;
    this.authApiBase = 'http://localhost:8888';
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * 設置中間件
   */
  setupMiddleware() {
    // 靜態文件服務
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.use(express.json());
    
    // CORS 支持
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
  }

  /**
   * 設置路由
   */
  setupRoutes() {
    /**
     * 根路由 - 提供儀表板
     */
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    /**
     * 健康檢查
     */
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok',
        dashboard: 'running',
        timestamp: new Date()
      });
    });

    /**
     * API 代理 - 生成配對碼
     */
    this.app.post('/api/pair/request', async (req, res) => {
      try {
        const response = await axios.post(
          `${this.authApiBase}/api/pair/request`,
          req.body,
          { timeout: 5000 }
        );
        res.json(response.data);
      } catch (error) {
        console.error('Pair request failed:', error.message);
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * API 代理 - 確認配對
     */
    this.app.post('/api/pair/confirm', async (req, res) => {
      try {
        const response = await axios.post(
          `${this.authApiBase}/api/pair/confirm`,
          req.body,
          { timeout: 5000 }
        );
        res.json(response.data);
      } catch (error) {
        console.error('Pair confirm failed:', error.message);
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * API 代理 - 系統狀態
     */
    this.app.get('/api/status', async (req, res) => {
      try {
        const response = await axios.get(
          `${this.authApiBase}/api/status`,
          { timeout: 5000 }
        );
        res.json(response.data);
      } catch (error) {
        console.error('Status failed:', error.message);
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * API 代理 - 設備列表
     */
    this.app.get('/api/devices', async (req, res) => {
      try {
        const response = await axios.get(
          `${this.authApiBase}/api/devices`,
          { timeout: 5000 }
        );
        res.json(response.data);
      } catch (error) {
        console.error('Devices failed:', error.message);
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * API 代理 - 日誌
     */
    this.app.get('/api/logs', async (req, res) => {
      try {
        const limit = req.query.limit || 50;
        const response = await axios.get(
          `${this.authApiBase}/api/logs?limit=${limit}`,
          { timeout: 5000 }
        );
        res.json(response.data);
      } catch (error) {
        console.error('Logs failed:', error.message);
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * 404 路由
     */
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });

    /**
     * 錯誤處理
     */
    this.app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({ error: err.message });
    });
  }

  /**
   * 啟動伺服器
   */
  start() {
    this.app.listen(this.port, '0.0.0.0', () => {
      console.log(`\n📊 儀表板伺服器已啟動`);
      console.log(`🌐 本地訪問: http://localhost:${this.port}`);
      console.log(`🔗 Tailscale: https://desktop-vil1hl8.tail1bf179.ts.net`);
      console.log(`✅ API 代理已啟用\n`);
    });
  }
}

// 啟動儀表板
const dashboard = new DashboardServer();
dashboard.start();

module.exports = DashboardServer;

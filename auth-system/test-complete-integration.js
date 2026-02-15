/**
 * RemoteAI Guardian - LINE 集成完整測試
 * 測試所有 LINE 功能和 iPhone 集成
 */

const axios = require('axios');
require('dotenv').config();

class IntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    
    this.baseUrl = 'http://localhost';
    this.tailscaleIP = process.env.TAILSCALE_IP || 'your-ip';
  }

  /**
   * 記錄測試結果
   */
  logTest(name, status, details = '') {
    const result = {
      test: name,
      status: status,
      timestamp: new Date().toLocaleString('zh-TW')
    };

    if (details) result.details = details;

    this.results.tests.push(result);

    if (status === 'PASSED') {
      this.results.passed++;
      console.log(`✅ ${name}`);
    } else if (status === 'FAILED') {
      this.results.failed++;
      console.log(`❌ ${name}: ${details}`);
    } else {
      console.log(`⚠️ ${name}: ${details}`);
    }
  }

  /**
   * 測試認證系統
   */
  async testAuthSystem() {
    console.log('\n🧪 測試認證系統...\n');

    try {
      const response = await axios.get(`${this.baseUrl}:8888/api/status`, { timeout: 5000 });
      
      if (response.data.status === 'running') {
        this.logTest('認證系統連接', 'PASSED');
        this.logTest('系統狀態檢查', 'PASSED', 
          `已配對: ${response.data.pairedDevices}, 活躍令牌: ${response.data.activeTokens}`);
      } else {
        this.logTest('認證系統連接', 'FAILED', '系統未運行');
      }
    } catch (error) {
      this.logTest('認證系統連接', 'FAILED', error.message);
    }
  }

  /**
   * 測試儀表板
   */
  async testDashboard() {
    console.log('\n🧪 測試 iPhone 儀表板...\n');

    try {
      // 測試儀表板主頁
      const mainResponse = await axios.get(`${this.baseUrl}:9999/`, { timeout: 5000 });
      if (mainResponse.status === 200) {
        this.logTest('儀表板主頁加載', 'PASSED');
      }

      // 測試 API 端點
      const statusResponse = await axios.get(`${this.baseUrl}:9999/api/dashboard/status`, { timeout: 5000 });
      this.logTest('儀表板 API - 系統狀態', 'PASSED');

      // 測試設備列表
      const devicesResponse = await axios.get(`${this.baseUrl}:9999/api/dashboard/devices`, { timeout: 5000 });
      this.logTest('儀表板 API - 設備列表', 'PASSED', 
        `已獲取 ${devicesResponse.data.devices?.length || 0} 個設備`);

    } catch (error) {
      this.logTest('儀表板測試', 'FAILED', error.message);
    }
  }

  /**
   * 測試 LINE 命令處理器
   */
  async testLineHandler() {
    console.log('\n🧪 測試 LINE 命令處理器...\n');

    try {
      // 測試健康檢查
      const healthResponse = await axios.get(`${this.baseUrl}:3001/health`, { timeout: 5000 });
      if (healthResponse.data.status === 'ok') {
        this.logTest('LINE 處理器健康檢查', 'PASSED');
      }

      // 測試任務 API
      const tasksResponse = await axios.get(`${this.baseUrl}:3001/api/tasks`, { timeout: 5000 });
      this.logTest('LINE 處理器 API - 任務列表', 'PASSED', 
        `已獲取 ${tasksResponse.data.tasks?.length || 0} 個任務`);

    } catch (error) {
      this.logTest('LINE 處理器測試', 'FAILED', error.message);
    }
  }

  /**
   * 測試 LINE 環境變數
   */
  testLineEnvironment() {
    console.log('\n🧪 測試 LINE 環境配置...\n');

    const required = [
      'LINE_CHANNEL_ID',
      'LINE_CHANNEL_SECRET',
      'LINE_ACCESS_TOKEN',
      'LINE_USER_ID'
    ];

    let allSet = true;

    for (const key of required) {
      if (process.env[key]) {
        const value = process.env[key];
        const masked = value.substring(0, 4) + '...' + value.substring(value.length - 4);
        this.logTest(`環境變數: ${key}`, 'PASSED', `已設置 (${masked})`);
      } else {
        this.logTest(`環境變數: ${key}`, 'FAILED', '未設置');
        allSet = false;
      }
    }

    if (allSet) {
      this.logTest('LINE 完整配置', 'PASSED');
    } else {
      this.logTest('LINE 完整配置', 'FAILED', '某些環境變數缺失');
    }
  }

  /**
   * 測試 Tailscale 配置
   */
  testTailscaleConfig() {
    console.log('\n🧪 測試 Tailscale 配置...\n');

    if (process.env.TAILSCALE_IP) {
      this.logTest('Tailscale Windows IP', 'PASSED', process.env.TAILSCALE_IP);
    } else {
      this.logTest('Tailscale Windows IP', 'FAILED', '未配置');
    }

    if (process.env.TAILSCALE_PHONE_IP) {
      this.logTest('Tailscale iPhone IP', 'PASSED', process.env.TAILSCALE_PHONE_IP);
    } else {
      this.logTest('Tailscale iPhone IP', 'WARNING', '可選配置');
    }
  }

  /**
   * 測試連接性
   */
  async testConnectivity() {
    console.log('\n🧪 測試服務連接...\n');

    const endpoints = [
      { name: '認證系統', url: `${this.baseUrl}:8888/health` },
      { name: '儀表板', url: `${this.baseUrl}:9999/health` },
      { name: 'LINE 處理器', url: `${this.baseUrl}:3001/health` }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint.url, { timeout: 5000 });
        this.logTest(`連接: ${endpoint.name}`, 'PASSED');
      } catch (error) {
        this.logTest(`連接: ${endpoint.name}`, 'FAILED', error.message);
      }
    }
  }

  /**
   * 生成訪問指南
   */
  generateAccessGuide() {
    console.log('\n📱 訪問指南:\n');

    console.log('🌐 本地訪問:');
    console.log('  • 認證系統:    http://localhost:8888');
    console.log('  • 儀表板:      http://localhost:9999');
    console.log('  • LINE Webhook: http://localhost:3001/webhook/line');

    console.log('\n📡 Tailscale 遠程訪問 (iPhone):');
    console.log(`  • 儀表板: http://${this.tailscaleIP}:9999`);
    console.log(`  • 認證:   http://${this.tailscaleIP}:8888`);

    console.log('\n💬 LINE 命令測試:');
    console.log('  在你的個人 LINE 帳號上傳送以下命令:');
    console.log('  • help      - 查看所有可用命令');
    console.log('  • status    - 檢查系統狀態');
    console.log('  • devices   - 列出已配對設備');
    console.log('  • stats     - 系統資源統計');
    console.log('  • run docker ps  - 執行 Docker 命令');
  }

  /**
   * 生成測試報告
   */
  printReport() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║           📊 完整測試報告                            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log(`✅ 通過: ${this.results.passed}`);
    console.log(`❌ 失敗: ${this.results.failed}`);
    console.log(`📊 成功率: ${this.results.passed}/${this.results.passed + this.results.failed}\n`);

    if (this.results.failed === 0) {
      console.log('🎉 所有測試均已通過！系統已準備好使用。\n');
    } else {
      console.log('⚠️ 某些測試失敗，請檢查上述錯誤信息。\n');
    }

    // 詳細報告
    console.log('詳細測試結果:');
    console.log('─'.repeat(56));

    for (const test of this.results.tests) {
      const statusIcon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⚠️';
      const details = test.details ? ` (${test.details})` : '';
      console.log(`${statusIcon} ${test.test}${details}`);
    }
  }

  /**
   * 運行所有測試
   */
  async runAll() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  RemoteAI Guardian - 完整系統測試                    ║');
    console.log('║  版本: 1.0.0 (iPhone + LINE 完全整合)                 ║');
    console.log('╚════════════════════════════════════════════════════════╝');

    await this.testAuthSystem();
    await this.testDashboard();
    await this.testLineHandler();
    this.testLineEnvironment();
    this.testTailscaleConfig();
    await this.testConnectivity();

    this.generateAccessGuide();
    this.printReport();

    console.log('💡 提示: 確保以下服務正在運行:');
    console.log('  1. npm start              (認證系統 + 儀表板)');
    console.log('  2. node line-command-handler.js  (LINE 處理器)');
    console.log('  3. iPhone Tailscale 應用  (已連接)');

    console.log('\n📖 完整設置指南: 查看 IPHONE_LINE_SETUP.md\n');
  }
}

// 運行測試
const tester = new IntegrationTester();
tester.runAll().catch(console.error);

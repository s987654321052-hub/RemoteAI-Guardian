#!/usr/bin/env node

/**
 * RemoteAI Guardian - 啟動腳本
 * 同時啟動認證系統和儀表板
 */

const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

class ApplicationStarter {
  constructor() {
    this.processes = [];
    this.setupSignalHandlers();
  }

  /**
   * 啟動認證系統
   */
  startAuthSystem() {
    console.log('🚀 啟動認證系統...');
    
    const authProcess = spawn('node', ['auth-system.js'], {
      cwd: path.join(__dirname, 'auth-system'),
      stdio: 'inherit',
      env: process.env
    });

    authProcess.on('error', (error) => {
      console.error('❌ 認證系統啟動失敗:', error);
      process.exit(1);
    });

    this.processes.push({ name: '認證系統', process: authProcess });
    return authProcess;
  }

  /**
   * 啟動儀表板
   */
  startDashboard() {
    console.log('🚀 啟動儀表板...');
    
    const dashboardProcess = spawn('node', ['dashboard.js'], {
      cwd: path.join(__dirname, 'auth-system'),
      stdio: 'inherit',
      env: process.env
    });

    dashboardProcess.on('error', (error) => {
      console.error('❌ 儀表板啟動失敗:', error);
      process.exit(1);
    });

    this.processes.push({ name: '儀表板', process: dashboardProcess });
    return dashboardProcess;
  }

  /**
   * 設置信號處理器
   */
  setupSignalHandlers() {
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
  }

  /**
   * 優雅關閉
   */
  shutdown(signal) {
    console.log(`\n📋 收到 ${signal} 信號，開始優雅關閉...\n`);

    this.processes.forEach(({ name, process: proc }) => {
      console.log(`⏹️ 停止 ${name}...`);
      proc.kill('SIGTERM');
    });

    // 設置超時強制退出
    setTimeout(() => {
      console.error('❌ 強制退出應用');
      process.exit(1);
    }, 10000);
  }

  /**
   * 啟動所有服務
   */
  async start() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║ 🚀 RemoteAI Guardian 應用啟動');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`📝 環境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 認證端口: ${process.env.AUTH_PORT || 8888}`);
    console.log(`🎨 儀表板端口: ${process.env.DASHBOARD_PORT || 9999}\n`);

    // 啟動服務
    this.startAuthSystem();
    
    // 延遲啟動儀表板，確保認證系統先啟動
    setTimeout(() => {
      this.startDashboard();
    }, 2000);

    console.log('\n✅ 所有服務已啟動\n');
    console.log('📍 訪問地址:');
    console.log(`   • 儀表板: http://localhost:${process.env.DASHBOARD_PORT || 9999}`);
    console.log(`   • API: http://localhost:${process.env.AUTH_PORT || 8888}`);
    console.log(`   • Tailscale: https://desktop-vil1hl8.tail1bf179.ts.net\n`);
  }
}

// 執行
const starter = new ApplicationStarter();
starter.start().catch(error => {
  console.error('❌ 啟動失敗:', error);
  process.exit(1);
});

/**
 * RemoteAI Guardian - 第二階段：功能擴展
 * Google Sheets、Docs、Gmail API 集成
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class Phase2TaskRunner {
  constructor(progressManager) {
    this.progressManager = progressManager;
    this.phaseId = 'phase-2';
  }

  /**
   * 運行所有第二階段任務
   */
  async runAll() {
    console.log('\n🚀 開始第二階段：功能擴展\n');

    try {
      await this.setupGoogleSheetsIntegration();
      await this.setupGoogleDocsIntegration();
      await this.setupGmailIntegration();
      await this.setupAutomationSystem();

      console.log('\n✅ 第二階段完成！\n');
      return this.progressManager.getStats();
    } catch (error) {
      console.error('❌ 第二階段失敗:', error);
      throw error;
    }
  }

  /**
   * 設置 Google Sheets 集成
   */
  async setupGoogleSheetsIntegration() {
    console.log('📊 設置 Google Sheets 集成...');

    const taskId = 'task-2-1';
    
    try {
      // 創建示例代碼
      const sheetsCode = `/**
 * Google Sheets API 集成
 */

const { google } = require('googleapis');
const fs = require('fs');

class SheetsManager {
  constructor(authClient) {
    this.sheets = google.sheets({ version: 'v4', auth: authClient });
  }

  /**
   * 創建新試算表
   */
  async createSpreadsheet(title) {
    const spreadsheet = await this.sheets.spreadsheets.create({
      resource: {
        properties: { title: title }
      }
    });
    return spreadsheet.data.spreadsheetId;
  }

  /**
   * 寫入資料
   */
  async writeData(spreadsheetId, range, values) {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      resource: { values: values }
    });
  }

  /**
   * 讀取資料
   */
  async readData(spreadsheetId, range) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range
    });
    return response.data.values;
  }
}

module.exports = SheetsManager;
`;

      fs.writeFileSync(
        path.join(__dirname, 'integrations', 'sheets-manager.js'),
        sheetsCode
      );

      this.progressManager.updateTaskProgress(this.phaseId, taskId, 100, 'completed');
      console.log('✅ Google Sheets 集成完成');

      await this.progressManager.sendProgressNotification(
        this.phaseId,
        'Google Sheets API 集成',
        '✅ 已創建 Sheets API 管理器'
      );
    } catch (error) {
      console.error('❌ Google Sheets 集成失敗:', error);
      this.progressManager.updateTaskProgress(this.phaseId, taskId, 50, 'in-progress');
    }
  }

  /**
   * 設置 Google Docs 集成
   */
  async setupGoogleDocsIntegration() {
    console.log('📝 設置 Google Docs 集成...');

    const taskId = 'task-2-2';

    try {
      const docsCode = `/**
 * Google Docs API 集成
 */

const { google } = require('googleapis');

class DocsManager {
  constructor(authClient) {
    this.docs = google.docs({ version: 'v1', auth: authClient });
  }

  /**
   * 創建新文檔
   */
  async createDocument(title) {
    const response = await this.docs.documents.create({
      resource: {
        title: title
      }
    });
    return response.data.documentId;
  }

  /**
   * 更新文檔
   */
  async updateDocument(documentId, requests) {
    const response = await this.docs.documents.batchUpdate({
      documentId: documentId,
      resource: { requests: requests }
    });
    return response.data;
  }

  /**
   * 讀取文檔
   */
  async getDocument(documentId) {
    const response = await this.docs.documents.get({
      documentId: documentId
    });
    return response.data;
  }
}

module.exports = DocsManager;
`;

      fs.writeFileSync(
        path.join(__dirname, 'integrations', 'docs-manager.js'),
        docsCode
      );

      this.progressManager.updateTaskProgress(this.phaseId, taskId, 100, 'completed');
      console.log('✅ Google Docs 集成完成');

      await this.progressManager.sendProgressNotification(
        this.phaseId,
        'Google Docs API 集成',
        '✅ 已創建 Docs API 管理器'
      );
    } catch (error) {
      console.error('❌ Google Docs 集成失敗:', error);
      this.progressManager.updateTaskProgress(this.phaseId, taskId, 50, 'in-progress');
    }
  }

  /**
   * 設置 Gmail 集成
   */
  async setupGmailIntegration() {
    console.log('📧 設置 Gmail 集成...');

    const taskId = 'task-2-3';

    try {
      const gmailCode = `/**
 * Gmail API 集成
 */

const { google } = require('googleapis');

class GmailManager {
  constructor(authClient) {
    this.gmail = google.gmail({ version: 'v1', auth: authClient });
  }

  /**
   * 列出郵件
   */
  async listMessages(query = '', maxResults = 10) {
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: maxResults
    });
    return response.data.messages || [];
  }

  /**
   * 取得郵件詳情
   */
  async getMessage(messageId) {
    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId
    });
    return response.data;
  }

  /**
   * 發送郵件
   */
  async sendMessage(to, subject, body) {
    const message = Buffer.from(
      \`To: \${to}\\r\\nSubject: \${subject}\\r\\n\\r\\n\${body}\`
    ).toString('base64');

    const response = await this.gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: message
      }
    });
    return response.data;
  }
}

module.exports = GmailManager;
`;

      fs.writeFileSync(
        path.join(__dirname, 'integrations', 'gmail-manager.js'),
        gmailCode
      );

      this.progressManager.updateTaskProgress(this.phaseId, taskId, 100, 'completed');
      console.log('✅ Gmail 集成完成');

      await this.progressManager.sendProgressNotification(
        this.phaseId,
        'Gmail API 集成',
        '✅ 已創建 Gmail 管理器'
      );
    } catch (error) {
      console.error('❌ Gmail 集成失敗:', error);
      this.progressManager.updateTaskProgress(this.phaseId, taskId, 50, 'in-progress');
    }
  }

  /**
   * 設置自動化任務系統
   */
  async setupAutomationSystem() {
    console.log('🤖 設置自動化任務系統...');

    const taskId = 'task-2-4';

    try {
      const automationCode = `/**
 * 自動化任務系統
 */

class TaskScheduler {
  constructor() {
    this.tasks = [];
    this.running = false;
  }

  /**
   * 添加定時任務
   */
  addTask(name, cron, callback) {
    this.tasks.push({
      id: Date.now(),
      name: name,
      cron: cron,
      callback: callback,
      lastRun: null,
      nextRun: null,
      enabled: true
    });
  }

  /**
   * 運行任務
   */
  async runTask(task) {
    try {
      console.log(\`▶️ 運行任務: \${task.name}\`);
      await task.callback();
      task.lastRun = new Date();
      console.log(\`✅ 任務完成: \${task.name}\`);
    } catch (error) {
      console.error(\`❌ 任務失敗: \${task.name}\`, error);
    }
  }

  /**
   * 啟動排程器
   */
  start() {
    if (this.running) return;
    this.running = true;
    console.log('🚀 任務排程器已啟動');

    setInterval(() => {
      const now = new Date();
      this.tasks.forEach(task => {
        if (task.enabled && this.shouldRun(task, now)) {
          this.runTask(task);
        }
      });
    }, 60000); // 每分鐘檢查一次
  }

  shouldRun(task, now) {
    // 簡化版本，實際應使用 cron 庫
    return !task.lastRun || 
           (now.getTime() - task.lastRun.getTime()) > 3600000; // 1 小時
  }
}

module.exports = TaskScheduler;
`;

      fs.writeFileSync(
        path.join(__dirname, 'integrations', 'task-scheduler.js'),
        automationCode
      );

      this.progressManager.updateTaskProgress(this.phaseId, taskId, 100, 'completed');
      console.log('✅ 自動化任務系統完成');

      await this.progressManager.sendProgressNotification(
        this.phaseId,
        '自動化任務系統',
        '✅ 已創建任務排程器'
      );
    } catch (error) {
      console.error('❌ 自動化系統設置失敗:', error);
      this.progressManager.updateTaskProgress(this.phaseId, taskId, 50, 'in-progress');
    }
  }
}

module.exports = Phase2TaskRunner;

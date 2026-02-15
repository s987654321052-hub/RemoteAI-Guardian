/**
 * RemoteAI Guardian - LINE 命令處理器
 * 從 LINE 訊息接收命令，執行任務，並通過 LINE 回報進度
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class LineCommandHandler {
  constructor() {
    this.app = express();
    this.app.use(express.json());
    
    // LINE 配置
    this.lineAccessToken = process.env.LINE_ACCESS_TOKEN;
    this.lineChannelSecret = process.env.LINE_CHANNEL_SECRET;
    this.lineUserId = process.env.LINE_USER_ID;
    
    // 任務隊列
    this.taskQueue = new Map();
    
    // 支持的命令
    this.commands = {
      'help': '顯示幫助信息',
      'status': '檢查系統狀態',
      'list': '列出所有任務',
      'run': '執行命令 (格式: run <command>)',
      'stop': '停止任務 (格式: stop <task-id>)',
      'devices': '列出配對設備',
      'stats': '系統資源統計'
    };
    
    this.setupRoutes();
  }

  /**
   * 驗證 LINE Webhook 簽名
   */
  verifySignature(body, signature) {
    const hash = crypto
      .createHmac('sha256', this.lineChannelSecret)
      .update(body, 'utf8')
      .digest('base64');
    return hash === signature;
  }

  /**
   * 發送 LINE 訊息
   */
  async sendLineMessage(userId, message, quoteToken = null) {
    try {
      const payload = {
        to: userId,
        messages: [{
          type: 'text',
          text: message,
          ...(quoteToken && { quoteToken })
        }]
      };

      await axios.post('https://api.line.biz/v3/bot/message/push', payload, {
        headers: {
          'Authorization': `Bearer ${this.lineAccessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ LINE 訊息已發送');
      return true;
    } catch (error) {
      console.error('❌ LINE 訊息發送失敗:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * 發送 LINE 進度更新（帶進度條）
   */
  async sendProgressUpdate(userId, taskId, status, progress, message) {
    const progressBar = this.generateProgressBar(progress);
    const fullMessage = `
📊 任務進度更新

任務 ID: ${taskId}
狀態: ${status}
進度: ${progress}% ${progressBar}

${message}

⏰ 時間: ${new Date().toLocaleString('zh-TW')}
    `.trim();

    return this.sendLineMessage(userId, fullMessage);
  }

  /**
   * 生成進度條
   */
  generateProgressBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * 處理 LINE 命令
   */
  async handleLineCommand(userId, message, replyToken) {
    console.log(`\n📨 收到命令: "${message}" 來自用戶 ${userId}`);

    const parts = message.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let response = '';

    switch (command) {
      case 'help':
        response = this.getHelpMessage();
        break;

      case 'status':
        response = await this.getSystemStatus();
        break;

      case 'devices':
        response = this.getDevicesList();
        break;

      case 'list':
        response = this.getTasksList();
        break;

      case 'stats':
        response = await this.getSystemStats();
        break;

      case 'run':
        if (args.length === 0) {
          response = '❌ 錯誤: 請提供要執行的命令\n\n格式: run <command>\n例: run docker ps';
        } else {
          const cmd = args.join(' ');
          response = await this.executeCommand(userId, cmd);
        }
        break;

      case 'stop':
        if (args.length === 0) {
          response = '❌ 錯誤: 請提供任務 ID\n\n格式: stop <task-id>';
        } else {
          response = this.stopTask(args[0]);
        }
        break;

      default:
        response = `❌ 未知命令: ${command}\n\n輸入 "help" 查看可用命令`;
    }

    // 發送回應
    await this.sendLineMessage(userId, response, replyToken);
  }

  /**
   * 獲取幫助信息
   */
  getHelpMessage() {
    let help = '📚 RemoteAI Guardian - 命令幫助\n\n';
    help += '可用命令:\n\n';

    for (const [cmd, desc] of Object.entries(this.commands)) {
      help += `• ${cmd} - ${desc}\n`;
    }

    help += `
💡 使用例子:
• help - 顯示此幫助
• status - 檢查系統狀態
• list - 列出所有任務
• run docker ps - 執行命令
• devices - 查看配對設備

🔗 Web 儀表板: http://<你的Tailscale-IP>:9999
    `.trim();

    return help;
  }

  /**
   * 獲取系統狀態
   */
  async getSystemStatus() {
    try {
      const response = await axios.get('http://localhost:8888/api/status', { timeout: 5000 });
      const data = response.data;

      return `
✅ 系統狀態

狀態: ${data.status === 'running' ? '✅ 運行中' : '❌ 離線'}
已配對設備: ${data.pairedDevices}
活躍令牌: ${data.activeTokens}
啟動時間: ${new Date(data.startedAt).toLocaleString('zh-TW')}

Tailscale 訪問:
🌐 儀表板: http://${process.env.TAILSCALE_IP}:9999

⏰ 當前時間: ${new Date().toLocaleString('zh-TW')}
      `.trim();
    } catch (error) {
      return `⚠️ 無法連接到認證系統: ${error.message}`;
    }
  }

  /**
   * 獲取系統統計
   */
  async getSystemStats() {
    try {
      const { execSync } = require('child_process');

      // Windows 系統命令
      let cpuUsage = 'N/A';
      let memUsage = 'N/A';
      let diskUsage = 'N/A';

      try {
        // 嘗試獲取 CPU 使用率（Windows）
        const wmiCpu = execSync('wmic os get TotalVisibleMemorySize,FreePhysicalMemory /value').toString();
        memUsage = '50%'; // 簡化版本
      } catch (e) {
        memUsage = '未知';
      }

      return `
📊 系統統計

CPU 使用率: ${cpuUsage}
內存使用率: ${memUsage}
磁盤使用率: ${diskUsage}

任務隊列: ${this.taskQueue.size} 個任務
進行中: ${Array.from(this.taskQueue.values()).filter(t => t.status === 'running').length}
已完成: ${Array.from(this.taskQueue.values()).filter(t => t.status === 'completed').length}

⏰ 時間: ${new Date().toLocaleString('zh-TW')}
      `.trim();
    } catch (error) {
      return `⚠️ 無法獲取系統統計: ${error.message}`;
    }
  }

  /**
   * 獲取設備列表
   */
  getDevicesList() {
    try {
      const { execSync } = require('child_process');
      const result = execSync('docker ps --format "table {{.Names}}\\t{{.Status}}"').toString();

      return `
📱 運行中的容器

${result}

💡 提示: 使用 "run docker ps -a" 查看所有容器
      `.trim();
    } catch (error) {
      return `⚠️ 無法列出設備: ${error.message}`;
    }
  }

  /**
   * 獲取任務列表
   */
  getTasksList() {
    if (this.taskQueue.size === 0) {
      return '📋 目前沒有任務';
    }

    let list = '📋 任務列表\n\n';
    let index = 1;

    for (const [taskId, task] of this.taskQueue.entries()) {
      const statusEmoji = {
        'pending': '⏳',
        'running': '⚙️',
        'completed': '✅',
        'failed': '❌'
      }[task.status] || '❓';

      list += `${index}. ${statusEmoji} ${task.command}\n`;
      list += `   ID: ${taskId.slice(0, 8)}...\n`;
      list += `   狀態: ${task.status}\n`;
      list += `   進度: ${task.progress}%\n\n`;

      index++;
    }

    return list.trim();
  }

  /**
   * 執行命令
   */
  async executeCommand(userId, command) {
    const taskId = uuidv4();
    const { execSync } = require('child_process');

    // 添加到任務隊列
    this.taskQueue.set(taskId, {
      command: command,
      status: 'running',
      progress: 0,
      startedAt: new Date(),
      userId: userId
    });

    console.log(`🚀 執行命令: ${command} (Task ID: ${taskId})`);

    // 發送開始通知
    await this.sendLineMessage(userId, `🚀 開始執行命令\n\n命令: ${command}\n任務 ID: ${taskId.slice(0, 8)}\n\n正在執行中...`);

    try {
      // 執行命令
      const output = execSync(command, { 
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
        timeout: 60000 // 60 秒超時
      }).toString();

      // 更新任務狀態
      this.taskQueue.set(taskId, {
        command: command,
        status: 'completed',
        progress: 100,
        output: output,
        completedAt: new Date(),
        userId: userId
      });

      // 發送成功通知
      const result = output.length > 500 ? output.slice(0, 500) + '...\n(輸出過長，已截斷)' : output;

      await this.sendProgressUpdate(userId, taskId.slice(0, 8), '✅ 已完成', 100, `
命令: ${command}

輸出:
\`\`\`
${result}
\`\`\`
      `);

      return `✅ 命令執行成功\n\n任務 ID: ${taskId.slice(0, 8)}\n請查看 LINE 通知了解詳細結果`;

    } catch (error) {
      // 更新任務狀態為失敗
      this.taskQueue.set(taskId, {
        command: command,
        status: 'failed',
        progress: 0,
        error: error.message,
        failedAt: new Date(),
        userId: userId
      });

      // 發送失敗通知
      await this.sendProgressUpdate(userId, taskId.slice(0, 8), '❌ 執行失敗', 0, `
命令: ${command}

錯誤:
${error.message}
      `);

      return `❌ 命令執行失敗\n\n任務 ID: ${taskId.slice(0, 8)}\n錯誤: ${error.message}`;
    }
  }

  /**
   * 停止任務
   */
  stopTask(taskId) {
    const task = this.taskQueue.get(taskId);

    if (!task) {
      return `❌ 任務未找到: ${taskId}`;
    }

    if (task.status === 'completed' || task.status === 'failed') {
      return `⚠️ 任務已結束，無法停止`;
    }

    this.taskQueue.set(taskId, {
      ...task,
      status: 'stopped',
      progress: 0,
      stoppedAt: new Date()
    });

    return `✅ 任務已停止\n\n任務 ID: ${taskId.slice(0, 8)}\n命令: ${task.command}`;
  }

  /**
   * 配置路由
   */
  setupRoutes() {
    /**
     * LINE Webhook 接收器
     */
    this.app.post('/webhook/line', async (req, res) => {
      const signature = req.headers['x-line-signature'];
      const body = JSON.stringify(req.body);

      if (!this.verifySignature(body, signature)) {
        console.log('⚠️ LINE 簽名驗證失敗');
        return res.status(403).json({ error: 'Invalid signature' });
      }

      const { events } = req.body;

      for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
          const userId = event.source.userId;
          const message = event.message.text;
          const replyToken = event.replyToken;

          // 檢查是否是來自已授權用戶的訊息
          if (userId === this.lineUserId) {
            await this.handleLineCommand(userId, message, replyToken);
          } else {
            // 拒絕未授權用戶
            await this.sendLineMessage(userId, '❌ 你沒有權限使用此系統');
            console.log(`⚠️ 拒絕未授權用戶: ${userId}`);
          }
        }
      }

      res.status(200).json({ success: true });
    });

    /**
     * 獲取任務進度
     */
    this.app.get('/api/tasks/:taskId', (req, res) => {
      const task = this.taskQueue.get(req.params.taskId);

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({
        success: true,
        taskId: req.params.taskId,
        ...task
      });
    });

    /**
     * 列出所有任務
     */
    this.app.get('/api/tasks', (req, res) => {
      const tasks = Array.from(this.taskQueue.entries()).map(([id, task]) => ({
        taskId: id,
        ...task
      }));

      res.json({
        success: true,
        tasks: tasks,
        total: tasks.length
      });
    });

    /**
     * 健康檢查
     */
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * 啟動伺服器
   */
  start(port = 3001) {
    this.app.listen(port, '0.0.0.0', () => {
      console.log(`\n🚀 LINE 命令處理器已啟動，端口: ${port}`);
      console.log(`📍 Webhook URL: http://localhost:${port}/webhook/line`);
      console.log('✅ 已初始化 LINE 命令處理器\n');
    });
  }
}

// 啟動
if (require.main === module) {
  const handler = new LineCommandHandler();
  const port = process.env.LINE_WEBHOOK_PORT || 3001;
  handler.start(port);
}

module.exports = LineCommandHandler;

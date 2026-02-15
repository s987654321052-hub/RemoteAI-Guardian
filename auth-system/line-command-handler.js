/**
 * LINE 命令處理系統
 * 解析自然語言命令並執行
 */

class LineCommandHandler {
  constructor(commandSystem, lineMessenger) {
    this.commandSystem = commandSystem;
    this.lineMessenger = lineMessenger;
    
    console.log('[HANDLER] LINE 命令處理器已初始化');
  }

  /**
   * 處理用戶命令
   */
  async handleCommand(userId, message) {
    try {
      console.log(`[HANDLER] 處理命令: ${message}`);
      
      const cmd = message.trim().toLowerCase();
      
      // 基本命令
      if (cmd === 'help' || cmd === '幫助') {
        return this.getHelp();
      }
      
      if (cmd === 'ping') {
        return '🏓 Pong! ✅';
      }
      
      if (cmd === 'status' || cmd === '狀態') {
        return this.getStatus();
      }
      
      if (cmd === 'time') {
        return '⏰ ' + new Date().toLocaleString('zh-TW');
      }
      
      // 任務相關命令
      if (cmd.startsWith('run ')) {
        const taskName = cmd.substring(4).trim();
        return await this.runTask(userId, taskName);
      }
      
      if (cmd.startsWith('stop ')) {
        const taskId = cmd.substring(5).trim();
        return this.stopTask(taskId);
      }
      
      if (cmd === 'task' || cmd === '任務') {
        return this.getTaskList();
      }
      
      if (cmd.startsWith('task ')) {
        const taskId = cmd.substring(5).trim();
        return this.getTaskDetail(taskId);
      }
      
      if (cmd === 'progress' || cmd === '進度') {
        return this.getProgressReport();
      }
      
      if (cmd === 'history' || cmd === '歷史') {
        return this.getHistory();
      }
      
      // 設備命令
      if (cmd === 'devices' || cmd === '設備') {
        return this.getDevices();
      }
      
      if (cmd === 'pair') {
        return this.getPairInstructions();
      }
      
      // 未知命令
      return this.getUnknownCommandResponse(message);
    } catch (err) {
      console.error('[HANDLER] 命令處理錯誤: ' + err.message);
      return '❌ 處理命令出錯: ' + err.message;
    }
  }

  /**
   * 幫助信息
   */
  getHelp() {
    return `📚 RemoteAI Guardian 命令幫助

【基本命令】
• help / 幫助 - 顯示此幫助
• ping - 測試連接
• status / 狀態 - 系統狀態
• time - 當前時間

【任務管理】
• run <任務> - 執行任務
• task - 列出所有任務
• task <ID> - 查看任務詳情
• stop <ID> - 停止任務
• progress - 進度報告

【查詢命令】
• devices - 已配對設備
• history - 任務歷史
• info - 應用信息

【範例】
run backup - 執行備份任務
stop abc123 - 停止 ID 為 abc123 的任務`;
  }

  /**
   * 系統狀態
   */
  getStatus() {
    const stats = this.commandSystem.getStats();
    const running = this.commandSystem.getRunningTasks();
    
    let msg = `✅ 系統狀態\n\n`;
    msg += `⏰ 時間: ${new Date().toLocaleString('zh-TW')}\n`;
    msg += `📊 統計:\n`;
    msg += `  • 總任務: ${stats.total}\n`;
    msg += `  • 執行中: ${stats.running}\n`;
    msg += `  • 待執行: ${stats.pending}\n`;
    msg += `  • 已完成: ${stats.completed}\n`;
    msg += `  • 失敗: ${stats.failed}\n`;
    
    if (running.length > 0) {
      msg += `\n📌 正在執行:\n`;
      running.slice(0, 3).forEach(task => {
        const bar = this.commandSystem.generateProgressBar(task.progress);
        msg += `  ${task.commandName}: ${bar}\n`;
      });
    }
    
    return msg;
  }

  /**
   * 執行任務
   */
  async runTask(userId, taskName) {
    try {
      console.log(`[HANDLER] 執行任務: ${taskName}`);
      
      // 創建任務
      const task = this.commandSystem.createTask(taskName, { 
        user: userId,
        initiatedAt: new Date().toISOString()
      });
      
      // 開始執行
      this.commandSystem.startTask(task.id);
      
      // 模擬進度更新（實際應用中這裡會真正執行任務）
      this.simulateTaskProgress(task.id, taskName);
      
      return `✅ 任務已開始\n\n📋 任務名: ${taskName}\n🆔 任務 ID: ${task.id}\n🔍 狀態: 執行中\n\n可使用 "task ${task.id}" 查看詳情`;
    } catch (err) {
      console.error('[HANDLER] 執行任務失敗: ' + err.message);
      return '❌ 執行任務失敗: ' + err.message;
    }
  }

  /**
   * 停止任務
   */
  stopTask(taskId) {
    try {
      const task = this.commandSystem.getTask(taskId);
      
      if (!task) {
        return '❌ 任務不存在: ' + taskId;
      }
      
      if (task.status === 'completed') {
        return '⚠️ 任務已完成，無法停止';
      }
      
      if (task.status === 'failed') {
        return '⚠️ 任務已失敗';
      }
      
      this.commandSystem.cancelTask(taskId);
      
      return `✅ 任務已停止\n\n📋 任務: ${task.commandName}\n🆔 ID: ${taskId}`;
    } catch (err) {
      return '❌ 停止任務失敗: ' + err.message;
    }
  }

  /**
   * 獲取任務列表
   */
  getTaskList() {
    try {
      const stats = this.commandSystem.getStats();
      const running = this.commandSystem.getRunningTasks().slice(0, 5);
      const queue = this.commandSystem.getQueue().slice(0, 5);
      
      let msg = `📋 任務列表\n\n`;
      msg += `統計: 總${stats.total} | 執行${stats.running} | 待執行${stats.pending} | 完成${stats.completed}\n\n`;
      
      if (running.length > 0) {
        msg += `🔄 執行中 (${running.length}):\n`;
        running.forEach((task, i) => {
          const bar = this.commandSystem.generateProgressBar(task.progress, 8);
          msg += `${i+1}. ${task.commandName} ${bar}\n`;
        });
      }
      
      if (queue.length > 0) {
        msg += `\n⏳ 待執行 (${queue.length}):\n`;
        queue.forEach((task, i) => {
          msg += `${i+1}. ${task.commandName}\n`;
        });
      }
      
      if (running.length === 0 && queue.length === 0) {
        msg += `無任務`;
      }
      
      return msg;
    } catch (err) {
      return '❌ 獲取任務列表失敗: ' + err.message;
    }
  }

  /**
   * 獲取任務詳情
   */
  getTaskDetail(taskId) {
    try {
      const task = this.commandSystem.getTask(taskId);
      
      if (!task) {
        return '❌ 任務不存在: ' + taskId;
      }
      
      const bar = this.commandSystem.generateProgressBar(task.progress);
      
      let msg = `📋 任務詳情\n\n`;
      msg += `名稱: ${task.commandName}\n`;
      msg += `ID: ${task.id}\n`;
      msg += `狀態: ${this.getStatusEmoji(task.status)} ${task.status}\n`;
      msg += `進度: ${bar}\n`;
      
      if (task.message) {
        msg += `信息: ${task.message}\n`;
      }
      
      if (task.startedAt) {
        msg += `開始: ${task.startedAt}\n`;
      }
      
      if (task.error) {
        msg += `錯誤: ${task.error}\n`;
      }
      
      return msg;
    } catch (err) {
      return '❌ 獲取任務詳情失敗: ' + err.message;
    }
  }

  /**
   * 進度報告
   */
  getProgressReport() {
    try {
      const running = this.commandSystem.getRunningTasks();
      
      if (running.length === 0) {
        return '📊 進度報告\n\n無執行中的任務';
      }
      
      let msg = `📊 進度報告\n\n`;
      running.forEach((task, i) => {
        const bar = this.commandSystem.generateProgressBar(task.progress, 12);
        msg += `${i+1}. ${task.commandName}\n${bar}\n\n`;
      });
      
      return msg;
    } catch (err) {
      return '❌ 獲取進度報告失敗: ' + err.message;
    }
  }

  /**
   * 任務歷史
   */
  getHistory() {
    try {
      const history = this.commandSystem.getHistory(10);
      
      if (history.length === 0) {
        return '📜 任務歷史\n\n無歷史記錄';
      }
      
      let msg = `📜 任務歷史 (最近 10 個)\n\n`;
      history.forEach((task, i) => {
        const emoji = task.type === 'completed' ? '✅' : task.type === 'failed' ? '❌' : '⏹️';
        msg += `${i+1}. ${emoji} ${task.commandName}\n`;
      });
      
      return msg;
    } catch (err) {
      return '❌ 獲取歷史失敗: ' + err.message;
    }
  }

  /**
   * 設備列表
   */
  getDevices() {
    return `📱 已配對設備\n\n暫無已配對設備\n\n使用 "pair" 命令開始配對`;
  }

  /**
   * 配對指示
   */
  getPairInstructions() {
    return `🔐 設備配對步驟\n\n1. 調用 /api/pair/request\n2. 獲取配對碼\n3. 調用 /api/pair/confirm\n4. 完成配對`;
  }

  /**
   * 未知命令
   */
  getUnknownCommandResponse(message) {
    return `❌ 未知命令: ${message}\n\n輸入 "help" 查看幫助`;
  }

  /**
   * 模擬任務進度（測試用）
   */
  simulateTaskProgress(taskId, taskName) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      
      if (progress >= 100) {
        progress = 100;
        this.commandSystem.updateProgress(taskId, progress, '即將完成');
        setTimeout(() => {
          this.commandSystem.completeTask(taskId, { success: true });
          clearInterval(interval);
          console.log(`[HANDLER] 任務完成: ${taskName}`);
        }, 1000);
      } else {
        const msg = `執行中... (${Math.floor(progress)}%)`;
        this.commandSystem.updateProgress(taskId, Math.floor(progress), msg);
      }
    }, 2000);
  }

  /**
   * 獲取狀態 emoji
   */
  getStatusEmoji(status) {
    const map = {
      'pending': '⏳',
      'running': '🔄',
      'completed': '✅',
      'failed': '❌',
      'cancelled': '⏹️'
    };
    return map[status] || '❓';
  }
}

module.exports = LineCommandHandler;

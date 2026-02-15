/**
 * 遠端指令系統
 * 管理任務執行、進度跟蹤和命令隊列
 */

const { v4: uuidv4 } = require('uuid');

class RemoteCommandSystem {
  constructor() {
    // 任務存儲
    this.tasks = new Map();
    
    // 命令隊列
    this.commandQueue = [];
    
    // 執行中的任務
    this.runningTasks = new Map();
    
    // 任務歷史
    this.taskHistory = [];
    
    console.log('[SYSTEM] 遠端指令系統已初始化');
  }

  /**
   * 創建新任務
   */
  createTask(commandName, args = {}) {
    const taskId = uuidv4();
    const task = {
      id: taskId,
      commandName: commandName,
      args: args,
      status: 'pending', // pending, running, completed, failed, cancelled
      progress: 0,
      message: '',
      startedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      error: null,
      result: null
    };

    this.tasks.set(taskId, task);
    this.commandQueue.push(taskId);

    console.log(`[TASK] 已創建任務: ${commandName} (${taskId})`);
    
    return task;
  }

  /**
   * 開始執行任務
   */
  startTask(taskId) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new Error('任務不存在: ' + taskId);
    }

    if (task.status !== 'pending') {
      throw new Error('任務狀態不允許執行: ' + task.status);
    }

    task.status = 'running';
    task.startedAt = new Date().toISOString();
    this.runningTasks.set(taskId, task);

    console.log(`[TASK] 任務已開始執行: ${taskId}`);
    
    return task;
  }

  /**
   * 更新任務進度
   */
  updateProgress(taskId, progress, message = '') {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new Error('任務不存在: ' + taskId);
    }

    task.progress = Math.min(progress, 100);
    if (message) {
      task.message = message;
    }

    console.log(`[TASK] 進度更新: ${taskId} - ${progress}%`);
    
    return task;
  }

  /**
   * 完成任務
   */
  completeTask(taskId, result = null) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new Error('任務不存在: ' + taskId);
    }

    task.status = 'completed';
    task.progress = 100;
    task.completedAt = new Date().toISOString();
    task.result = result;
    
    this.runningTasks.delete(taskId);
    this.taskHistory.push({ ...task, type: 'completed' });

    console.log(`[TASK] 任務已完成: ${taskId}`);
    
    return task;
  }

  /**
   * 失敗任務
   */
  failTask(taskId, error) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new Error('任務不存在: ' + taskId);
    }

    task.status = 'failed';
    task.completedAt = new Date().toISOString();
    task.error = error.message || error;
    
    this.runningTasks.delete(taskId);
    this.taskHistory.push({ ...task, type: 'failed' });

    console.error(`[TASK] 任務失敗: ${taskId} - ${error.message || error}`);
    
    return task;
  }

  /**
   * 取消任務
   */
  cancelTask(taskId) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new Error('任務不存在: ' + taskId);
    }

    task.status = 'cancelled';
    task.completedAt = new Date().toISOString();
    
    this.runningTasks.delete(taskId);
    this.taskHistory.push({ ...task, type: 'cancelled' });

    console.log(`[TASK] 任務已取消: ${taskId}`);
    
    return task;
  }

  /**
   * 獲取任務詳情
   */
  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  /**
   * 獲取所有任務
   */
  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  /**
   * 獲取執行中的任務
   */
  getRunningTasks() {
    return Array.from(this.runningTasks.values());
  }

  /**
   * 獲取任務隊列
   */
  getQueue() {
    return this.commandQueue.map(taskId => this.tasks.get(taskId)).filter(t => t);
  }

  /**
   * 獲取任務歷史
   */
  getHistory(limit = 50) {
    return this.taskHistory.slice(-limit);
  }

  /**
   * 清空隊列（謹慎使用）
   */
  clearQueue() {
    this.commandQueue = [];
    console.log('[SYSTEM] 隊列已清空');
  }

  /**
   * 獲取系統統計
   */
  getStats() {
    const allTasks = this.getAllTasks();
    const completed = allTasks.filter(t => t.status === 'completed').length;
    const failed = allTasks.filter(t => t.status === 'failed').length;
    const running = this.runningTasks.size;
    const pending = this.commandQueue.length;

    return {
      total: allTasks.length,
      running: running,
      pending: pending,
      completed: completed,
      failed: failed,
      queueLength: this.commandQueue.length
    };
  }

  /**
   * 生成進度條
   */
  generateProgressBar(progress, length = 10) {
    const filled = Math.floor((progress / 100) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${progress}%`;
  }
}

module.exports = RemoteCommandSystem;

/**
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
      console.log(`▶️ 運行任務: ${task.name}`);
      await task.callback();
      task.lastRun = new Date();
      console.log(`✅ 任務完成: ${task.name}`);
    } catch (error) {
      console.error(`❌ 任務失敗: ${task.name}`, error);
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

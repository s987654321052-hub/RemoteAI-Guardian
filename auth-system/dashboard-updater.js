/**
 * RemoteAI Guardian - 儀表板更新工具
 * 用於更新項目監控儀表板的進度
 */

const axios = require('axios');

class DashboardUpdater {
  constructor(dashboardUrl = 'http://127.0.0.1:9999') {
    this.dashboardUrl = dashboardUrl;
  }

  /**
   * 更新任務狀態和進度
   */
  async updateTask(taskId, status, progress, details = {}) {
    try {
      const response = await axios.post(
        `${this.dashboardUrl}/api/task/${taskId}`,
        {
          status: status,
          progress: progress,
          ...details
        }
      );
      
      console.log(`✅ 已更新任務: ${taskId} - ${status} (${progress}%)`);
      return response.data;
    } catch (error) {
      console.error(`❌ 更新任務失敗: ${error.message}`);
      throw error;
    }
  }

  /**
   * 開始任務
   */
  async startTask(taskId) {
    return this.updateTask(taskId, 'IN_PROGRESS', 10);
  }

  /**
   * 更新任務進度
   */
  async updateProgress(taskId, progress) {
    return this.updateTask(taskId, 'IN_PROGRESS', progress);
  }

  /**
   * 完成任務
   */
  async completeTask(taskId) {
    return this.updateTask(taskId, 'COMPLETED', 100);
  }

  /**
   * 標記任務失敗
   */
  async failTask(taskId, reason = '') {
    return this.updateTask(taskId, 'FAILED', 0, { reason });
  }

  /**
   * 批量更新多個任務
   */
  async updateMultipleTasks(updates) {
    const results = [];
    for (const update of updates) {
      try {
        const result = await this.updateTask(
          update.taskId,
          update.status,
          update.progress,
          update.details
        );
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    return results;
  }

  /**
   * 獲取項目摘要
   */
  async getProjectSummary() {
    try {
      const response = await axios.get(`${this.dashboardUrl}/api/project`);
      return response.data;
    } catch (error) {
      console.error('無法獲取項目摘要:', error.message);
      throw error;
    }
  }
}

// 使用示例
async function exampleUsage() {
  const updater = new DashboardUpdater();
  
  try {
    // 開始第一個任務
    console.log('開始任務: task-auth-1');
    await updater.startTask('task-auth-1');
    
    // 模擬進度更新
    console.log('\n更新進度...');
    for (let i = 10; i <= 100; i += 10) {
      await updater.updateProgress('task-auth-1', i);
      // 延遲以模擬工作
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 完成任務
    console.log('\n完成任務');
    await updater.completeTask('task-auth-1');
    
    // 開始下一個任務
    console.log('\n開始下一個任務: task-auth-2');
    await updater.startTask('task-auth-2');
    await updater.updateProgress('task-auth-2', 50);
    
    // 獲取項目摘要
    console.log('\n獲取項目摘要...');
    const summary = await updater.getProjectSummary();
    console.log('項目進度:', summary.progress + '%');
    console.log('已完成任務:', summary.completedTasks);
    
  } catch (error) {
    console.error('錯誤:', error);
  }
}

// 如果直接執行此文件
if (require.main === module) {
  exampleUsage();
}

module.exports = DashboardUpdater;

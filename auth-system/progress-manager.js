/**
 * RemoteAI Guardian - 進度管理系統
 * 追蹤項目進度、任務完成情況
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

class ProgressManager {
  constructor() {
    this.progressFile = path.join(__dirname, '../data', 'progress.json');
    this.milestonesFile = path.join(__dirname, '../data', 'milestones.json');
    this.ensureDataDir();
    this.loadProgress();
    this.lineAccessToken = process.env.LINE_ACCESS_TOKEN;
    this.lineUserId = process.env.LINE_USER_ID;
  }

  ensureDataDir() {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  loadProgress() {
    try {
      if (fs.existsSync(this.progressFile)) {
        this.progress = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
      } else {
        this.progress = this.initializeProgress();
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      this.progress = this.initializeProgress();
    }
  }

  initializeProgress() {
    return {
      project: 'RemoteAI Guardian',
      phases: [
        {
          id: 'phase-1',
          name: '第一階段：基礎設置',
          progress: 0,
          status: 'in-progress',
          startDate: new Date().toISOString(),
          tasks: [
            { id: 'task-1-1', name: 'Python 3.12.9 安裝', progress: 100, status: 'completed' },
            { id: 'task-1-2', name: 'Google Service Account 設置', progress: 100, status: 'completed' },
            { id: 'task-1-3', name: 'Tailscale 配置', progress: 100, status: 'completed' },
            { id: 'task-1-4', name: '認證系統開發', progress: 100, status: 'completed' },
            { id: 'task-1-5', name: 'LINE 通知集成', progress: 100, status: 'completed' },
            { id: 'task-1-6', name: '儀表板開發', progress: 100, status: 'completed' },
            { id: 'task-1-7', name: 'iPhone 配對測試', progress: 100, status: 'completed' }
          ]
        },
        {
          id: 'phase-2',
          name: '第二階段：功能擴展',
          progress: 0,
          status: 'pending',
          tasks: [
            { id: 'task-2-1', name: 'Google Sheets API 集成', progress: 0, status: 'pending' },
            { id: 'task-2-2', name: 'Google Docs API 集成', progress: 0, status: 'pending' },
            { id: 'task-2-3', name: 'Gmail API 集成', progress: 0, status: 'pending' },
            { id: 'task-2-4', name: '自動化任務系統', progress: 0, status: 'pending' }
          ]
        },
        {
          id: 'phase-3',
          name: '第三階段：優化和部署',
          progress: 0,
          status: 'pending',
          tasks: [
            { id: 'task-3-1', name: 'iOS App 開發', progress: 0, status: 'pending' },
            { id: 'task-3-2', name: '性能優化', progress: 0, status: 'pending' },
            { id: 'task-3-3', name: '安全加固', progress: 0, status: 'pending' },
            { id: 'task-3-4', name: '生產部署', progress: 0, status: 'pending' }
          ]
        }
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 更新任務進度
   */
  updateTaskProgress(phaseId, taskId, progress, status = null) {
    const phase = this.progress.phases.find(p => p.id === phaseId);
    if (!phase) return false;

    const task = phase.tasks.find(t => t.id === taskId);
    if (!task) return false;

    task.progress = progress;
    if (status) task.status = status;

    this.updatePhaseProgress(phaseId);
    this.saveProgress();

    return true;
  }

  /**
   * 計算階段進度
   */
  updatePhaseProgress(phaseId) {
    const phase = this.progress.phases.find(p => p.id === phaseId);
    if (!phase) return;

    const taskCount = phase.tasks.length;
    const totalProgress = phase.tasks.reduce((sum, task) => sum + task.progress, 0);
    phase.progress = Math.round(totalProgress / taskCount);

    const allCompleted = phase.tasks.every(t => t.status === 'completed');
    if (allCompleted && phase.progress === 100) {
      phase.status = 'completed';
      phase.endDate = new Date().toISOString();
    }

    this.progress.lastUpdated = new Date().toISOString();
  }

  /**
   * 保存進度
   */
  saveProgress() {
    try {
      fs.writeFileSync(this.progressFile, JSON.stringify(this.progress, null, 2));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * 取得進度統計
   */
  getStats() {
    const phases = this.progress.phases;
    const totalPhases = phases.length;
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = phases.reduce((sum, p) => 
      sum + p.tasks.filter(t => t.status === 'completed').length, 0
    );
    const overallProgress = Math.round(
      phases.reduce((sum, p) => sum + p.progress, 0) / totalPhases
    );

    return {
      phases: { total: totalPhases, completed: completedPhases },
      tasks: { total: totalTasks, completed: completedTasks },
      overallProgress: overallProgress,
      lastUpdated: this.progress.lastUpdated
    };
  }

  /**
   * 發送進度通知到 LINE
   */
  async sendProgressNotification(phaseId, taskName, message) {
    if (!this.lineAccessToken || !this.lineUserId) {
      console.log('⚠️ LINE 通知未配置');
      return;
    }

    try {
      const stats = this.getStats();
      const fullMessage = `📊 進度更新

🎯 任務: ${taskName}
📝 ${message}

📈 整體進度: ${stats.overallProgress}%
✅ 已完成: ${stats.tasks.completed}/${stats.tasks.total} 任務

時間: ${new Date().toLocaleString('zh-TW')}`;

      await axios.post('https://api.line.biz/v3/bot/message/push', {
        to: this.lineUserId,
        messages: [{ type: 'text', text: fullMessage }]
      }, {
        headers: {
          'Authorization': `Bearer ${this.lineAccessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ LINE 通知已發送');
    } catch (error) {
      console.error('Failed to send LINE notification:', error.message);
    }
  }

  /**
   * 完成任務
   */
  async completeTask(phaseId, taskId, taskName) {
    this.updateTaskProgress(phaseId, taskId, 100, 'completed');
    
    const stats = this.getStats();
    console.log(`✅ 任務完成: ${taskName} (${stats.tasks.completed}/${stats.tasks.total})`);

    await this.sendProgressNotification(phaseId, taskName, '✅ 已完成');

    return stats;
  }

  /**
   * 獲取完整進度報告
   */
  getFullReport() {
    const stats = this.getStats();
    const report = {
      ...stats,
      phases: this.progress.phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        progress: phase.progress,
        status: phase.status,
        tasks: phase.tasks.map(task => ({
          id: task.id,
          name: task.name,
          progress: task.progress,
          status: task.status
        }))
      }))
    };

    return report;
  }
}

module.exports = ProgressManager;

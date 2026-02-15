/**
 * RemoteAI Guardian - LINE 通知系統測試
 * 發送項目進度更新到 LINE
 */

const axios = require('axios');
require('dotenv').config();

class LineNotifier {
  constructor() {
    this.channelId = process.env.LINE_CHANNEL_ID;
    this.channelSecret = process.env.LINE_CHANNEL_SECRET;
    this.accessToken = process.env.LINE_ACCESS_TOKEN;
    this.userId = process.env.LINE_USER_ID;
    
    if (!this.accessToken) {
      console.error('❌ 缺少 LINE_ACCESS_TOKEN');
      process.exit(1);
    }
    
    if (!this.userId) {
      console.error('⚠️ 缺少 LINE_USER_ID，無法發送訊息');
      console.log('請先設置 LINE_USER_ID 環境變數');
    }
    
    this.lineApiUrl = 'https://api.line.biz/v3/bot/message/push';
  }

  /**
   * 發送文本訊息
   */
  async sendMessage(userId, message) {
    try {
      console.log(`📤 發送訊息到 ${userId}...`);
      
      const response = await axios.post(this.lineApiUrl, {
        to: userId,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ LINE 訊息已發送');
      return response.data;
    } catch (error) {
      console.error('❌ 發送 LINE 訊息失敗:');
      if (error.response?.data) {
        console.error('API 響應:', error.response.data);
      } else {
        console.error('錯誤:', error.message);
      }
      throw error;
    }
  }

  /**
   * 發送進度更新
   */
  async sendProgressUpdate(userId, projectName, progress, taskName, taskProgress) {
    const message = `📊 RemoteAI Guardian 進度更新

🎯 項目: ${projectName}
📈 整體進度: ${progress}%
✏️ 當前任務: ${taskName}
⏳ 任務進度: ${taskProgress}%

時間: ${new Date().toLocaleString('zh-TW')}`;

    return this.sendMessage(userId, message);
  }

  /**
   * 發送任務完成通知
   */
  async sendTaskCompleted(userId, taskName, nextTask) {
    const message = `✅ 任務完成！

🎉 "${taskName}" 已完成
⏭️ 下一個任務: ${nextTask}

RemoteAI Guardian 自動化系統
時間: ${new Date().toLocaleString('zh-TW')}`;

    return this.sendMessage(userId, message);
  }

  /**
   * 發送階段完成通知
   */
  async sendPhaseCompleted(userId, phaseName, nextPhase) {
    const message = `🚀 階段完成！

🎊 "${phaseName}" 已完成
📋 下一個階段: ${nextPhase}

RemoteAI Guardian 自動化系統
時間: ${new Date().toLocaleString('zh-TW')}`;

    return this.sendMessage(userId, message);
  }

  /**
   * 發送錯誤通知
   */
  async sendErrorNotification(userId, taskName, errorMessage) {
    const message = `⚠️ 發生錯誤

❌ 任務: ${taskName}
🔴 錯誤: ${errorMessage}

請立即檢查。

RemoteAI Guardian 自動化系統
時間: ${new Date().toLocaleString('zh-TW')}`;

    return this.sendMessage(userId, message);
  }

  /**
   * 發送系統啟動通知
   */
  async sendSystemStarted(userId) {
    const message = `✨ RemoteAI Guardian 系統已啟動

🌐 遠端 AI 助手已就緒
📱 蘋果手機認證: ✅
🔐 加密通訊: ✅
🎯 項目監控: ✅

開始第一階段開發...

時間: ${new Date().toLocaleString('zh-TW')}`;

    return this.sendMessage(userId, message);
  }

  /**
   * 發送每日摘要
   */
  async sendDailySummary(userId, summary) {
    const message = `📅 今日摘要

${summary.tasksCompleted} 個任務已完成
📈 整體進度: ${summary.overallProgress}%
⏱️ 總工作時間: ${summary.workHours} 小時
🎯 下一步: ${summary.nextMilestone}

時間: ${new Date().toLocaleString('zh-TW')}`;

    return this.sendMessage(userId, message);
  }
}

// 測試主函數
async function main() {
  const notifier = new LineNotifier();
  
  const userId = notifier.userId;
  
  if (!userId) {
    console.error('❌ 未設置 LINE_USER_ID，無法發送訊息');
    console.log('\n如何獲取你的 LINE User ID:');
    console.log('1. 使用 LINE 官方測試工具');
    console.log('2. 或從 LINE Webhook 事件中提取');
    console.log('3. 或使用 LINE Bot Designer 測試\n');
    return;
  }
  
  try {
    console.log('🧪 開始測試 LINE 通知...\n');
    
    // 發送系統啟動通知
    console.log('▶️ 測試 1: 發送系統啟動通知');
    await notifier.sendSystemStarted(userId);
    
    // 等待 1 秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 發送進度更新
    console.log('\n▶️ 測試 2: 發送進度更新');
    await notifier.sendProgressUpdate(
      userId,
      'RemoteAI Guardian',
      10,
      '蘋果裝置認證框架',
      25
    );
    
    // 等待 1 秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 發送任務完成通知
    console.log('\n▶️ 測試 3: 發送任務完成通知');
    await notifier.sendTaskCompleted(
      userId,
      'Tailscale Funnel 配置',
      'Google OAuth 整合'
    );
    
    console.log('\n✅ 所有 LINE 通知測試完成！');
    
  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message);
  }
}

// 如果直接執行此文件
if (require.main === module) {
  main();
}

module.exports = LineNotifier;
